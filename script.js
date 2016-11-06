// Finding these numbers involved LOTS of manual tinkering.
var WIDTH = 775;
var HEIGHT = 675;
var BUBBLE_PADDING = 5;

var MIN_START_RADIUS = 10;
var MAX_START_RADIUS = 80;
var MIN_RADIUS_SCALE_FACTOR = 5;
var MAX_RADIUS_SCALE_FACTOR = 1.5;

var TRANSITION_LENGTH = 750;

var NYT_LINK = "http://www.nytimes.com/interactive/2016/01/28/upshot/donald-trump-twitter-insults.html";

var isClicked = false;
var selectedElement = null;

var windowWith = 0;

/* FUNCTION SIGNATURES */

d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

// Scales the radius of the circle based on the number of insults.
function getStartRadius(count) {
    var radiusScale = d3.scale.linear()
        .domain([0, 20])
        .range([MIN_START_RADIUS, MAX_START_RADIUS]);
    return radiusScale(Math.sqrt(count));
}

function getTextSize(d) {
    // TODO: Edge case for the parent node. Do something better here!
    if (!d.name) {
        return;
    }
    var len = d.name.length;
    var wideCharacters = d.name.replace(/[^RGWwMm]/g, "").length;
    for (i = 0; i < wideCharacters; i++) {
        len++;
    }
    if (d.name == "Mary Katharine Ham" || d.name == "Melinda Henneberger") {
        len += 2;
    }
    var size = (d.r / 3) * (7 / len) + 1;
    return Math.round(size) + "px";
}

function mouseover() {
    if (!isClicked) {
        enlargeBubble(d3.select(this));
    }
}

function mouseout() {
    if (!isClicked) {
        shrinkBubble(d3.select(this));
    }
}

function enlargeBubble(node) {
    var radiusTransitionScale = d3.scale.linear()
        .domain([0, 20])
        .range([MIN_START_RADIUS * MIN_RADIUS_SCALE_FACTOR, MAX_START_RADIUS * MAX_RADIUS_SCALE_FACTOR]);

    node.moveToFront();

    node.select("circle").transition()
        .duration(TRANSITION_LENGTH)
        .attr("r", function(d) {
            d.r = radiusTransitionScale(Math.sqrt(d.count));
            return d.r;
        })
        .style("fill", "#f9f9f9");

    node.select("text").transition()
        .duration(TRANSITION_LENGTH)
        .style("font-size", getTextSize);
}

function shrinkBubble(node) {
    node.select("circle").transition()
        .duration(TRANSITION_LENGTH)
        .attr("r", function(d) {
            d.r = getStartRadius(d.count);
            return d.r;
        })
        .style("fill", "lavender");
    node.select("text").transition()
        .duration(TRANSITION_LENGTH)
        .style("font-size", getTextSize);
}

function click() {
    var thisNode = d3.select(this);
    if (!isClicked) {
        selectElement(thisNode);
    } else {
        var previouslySelectedElement = selectedElement;
        unselectElement();
        if (thisNode.text() !== previouslySelectedElement.text()) {
            enlargeBubble(thisNode);
            selectElement(thisNode);
        }
    }
}

function populateInfoBox(panel, data) {
    panel.selectAll(".name").text(data.name);
    panel.select(".bio").text(data.bio);

    var count = data.count;
    var countText = "";
    if (count == 1) {
        countText = "once";
    } else if (count == 2) {
        countText = "twice";
    } else {
        countText = count + " times";
    }
    panel.select(".count").text(countText);

    var insultHTML = "";
    var insultList = [];
    for (i = 0; i < data.insults.length; i++) {
        if (insultList.length == 3) {
            break;
        }
        var insult = data.insults[i].quotes_vec;
        if (insultList.indexOf(insult.toLowerCase()) != -1) {
            continue;
        }
        insultList.push(insult.toLowerCase());
        insultHTML += "<li><a href=\"" + data.insults[i].url + "\" target=\"_blank\">" + insult + "</a></li>";
    }
    panel.select(".insults")
        .html(insultHTML);
}

function selectElement(node) {
    if (node === null) {
        return;
    }
    enlargeBubble(node);

    isClicked = true;
    selectedElement = node;

    var intro = d3.select(".intro");
    intro.style("visibility", "hidden");

    var panel = d3.select(".info-panel");
    panel.style("visibility", "visible");

    var data = node.data()[0];
    populateInfoBox(panel, data);

}

function unselectElement() {
    if (!selectedElement) {
        return;
    }
    var panel = d3.select(".info-panel");
    panel.style("visibility", "hidden");
    panel.select(".name").select("text").remove();

    var intro = d3.select(".intro");
    intro.style("visibility", "visible");

    shrinkBubble(selectedElement);
    isClicked = false;
    selectedElement = null;
}

/* D3 CODE */

var svg = d3.select("div#container")
    .append("svg")
    .attr("viewBox", "0 0 " + WIDTH + " " + HEIGHT)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("class", "bubble")
    .append("g");

var bubble = d3.layout.pack()
    .sort(null)
    .size([WIDTH, HEIGHT])
    .value(function(d) {
        return d.count;
    })
    .radius(function(value) {
        return getStartRadius(value);
    })
    .padding(BUBBLE_PADDING);

d3.json("./data/data.json", function(data) {
    data = {
        children: data
    };
    var node = svg.selectAll(".node")
        .data(bubble.nodes(data)
            .filter(function(d) {
                return !d.children;
            }))
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("click", click);

    node.append("circle")
        .attr("r", function(d) {
            return getStartRadius(d.count);
        })
        .style("fill", "lavender")
        .style("stroke", "gray")
        .style("stroke-width", "1px");

    node.append("text")
        .style("text-anchor", "middle")
        .style("font-size", getTextSize)
        .style("font-family", "font-family: -apple-system, BlinkMacSystemFont, \"helvetica neue\", helvetica, sans-serif")
        .style("fill", function(d) {
            return d3.rgb("gray").darker().darker();
        })
        .text(function(d) {
            return d.name;
        });

    var total = d3.select(".total").text("" + node[0].length);
});

/* JQUERY FORMATTING */

function mobileLayout(width) {
    return width < 480;
}

function scaleSidebar() {
    // Sidebar is the same height as bubble chart
    var leftHeight = $(".bubble").height();
    $(".sidebar").css({
        'height': leftHeight
    });

    // Info panel takes up at most half of the sidebar
    $(".info-panel").css({
        'max-height': (leftHeight * 0.5)
    });

}

function fixLayout() {
    var previousWidth = windowWidth;
    windowWidth = window.outerWidth;

    // Switch from mobile layout to Desktop
    if (mobileLayout(previousWidth) && !mobileLayout(windowWidth)) {
        previouslySelectedElement = selectedElement;
        unselectElement();
        $(".info-panel").css({
            'visibility': 'hidden'
        });
        $(".sidebar").append($(".info-panel-container"));
        selectElement(previouslySelectedElement);

    } else if (!mobileLayout(previousWidth) && mobileLayout(windowWidth)) {
        previouslySelectedElement = selectedElement;
        unselectElement();
        $(".info-panel").css({
            'visibility': 'hidden'
        });
        $(".sidebar").css({
            'height': ($(".title").height() + $(".instructions").height()) * 1.5
        });
        $(".info-panel-container").insertAfter(".svg-container");
        selectElement(previouslySelectedElement);
    }

    if (!mobileLayout(window.outerWidth)) {
        scaleSidebar();
    }
}

var lazyLayout = _.debounce(fixLayout, 300);
$(window).resize(lazyLayout);

windowWidth = window.outerWidth;
if (mobileLayout(windowWidth)) {
    // Bubble chart appears before the info panel on mobile.
    $(".info-panel-container").insertAfter(".svg-container");
} else {
    scaleSidebar();
}
