var width = 1200;
var height = 500;

var circle;
var circles;
var arc;
var text;

var svg = d3.select('#chart')
    .append('svg')
    .attr('width', width )
    .attr('height', height);
    
    
// categorical colors pour les noeuds
var color = d3.scale.category20();

//Declaration de la fonction de fisheye
var fisheye = d3.fisheye.circular()
    .radius(100) // zoom radius
    .distortion(5); // Le zoom
    
    
// Intialisation de la force
var force = d3.layout.force()
    .charge(-400)
    .linkDistance(200)
    .size([width , height]) 
    .on("tick", tick); 


drag = force.drag()
    .on("dragstart", function(d){
    d3.select(this).classed("fixed", d.fixed = true);
    });

// parcours des donnéess
d3.json("ressources/data.json", function(data) {

    data.arcs.forEach(function (d) {
        if (typeof d.source == "number") { d.source = data.circles[d.source - 1]; }
        if (typeof d.target == "number") { d.target = data.circles[d.target - 1]; }
    });

    // pour que les noeuds soient correctement positionnes dans svg
    data.circles.forEach(function (d) {
        if (typeof d.x == "number") { d.x = d.x *width; }
        if (typeof d.y == "number") { d.y = d.y *height; }
    });

    // Creation des arcs
    var arcs = svg.selectAll(".link")
                    .data(data.arcs)
                    .enter()
                    .append("line");

    // Les attribut d'un arc
    arc =  arcs.attr("x1", function(d) { return d.source.x ; })
                    .attr("y1", function(d) { return d.source.y  ; })
                    .attr("x2", function(d) { return d.target.x ; })
                    .attr("y2", function(d) { return d.target.y ; })
                    .attr("stroke-width", function (d) { return 0.8*d.nb; })
                    .attr("stroke", "#AAA")
                    .attr("stroke-opacity", 0.7);

    // Creations des circle
    circles = svg.selectAll(".node")
                    .data(data.circles)
                    .enter().append("g")
                    .attr("class", "node");

    // Les attributs d'un cercle
    circle = circles.append("circle")
                    .attr("class", "circle")
                    .attr("cx", function(d) { return d.x ; })
                    .attr("cy", function(d) { return d.y ; })
                    .attr("r",  function(d) { return d.r *50 ; })
                    .style("fill", function(d) { return color(d.num); })
                    .style("stroke", "white")
                    .call(drag); //Pour l'algorithme de force

    // Les attributs de la zone text
    text = circles.append("text")
        .attr("class", "text")
        .text(function (d) { return (d.country); })
        .attr("x", function (d) { return d.x ; })
        .attr("y",  function (d) { return d.y ; })
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold");

    // Application de la force sur les nodes et links
    force.nodes(data.circles);
    force.links(data.arcs);

/*arcs.selectAll(".link").remove();
    circles.selectAll(".circle").remove();
    circles.selectAll(".text").remove();*/
    
})

// fonction pour appliquer fisheye
function runFisheye(){
    svg.on("mousemove", function() {
        fisheye.focus(d3.mouse(this));

        circle.each(function(d) { d.fisheye = fisheye(d); })
            .attr("cx", function(d) { return d.fisheye.x; })
            .attr("cy", function(d) { return d.fisheye.y ; })
            .attr("r", function(d) { return d.fisheye.z*25 ; });

        arc.attr("x1", function(d) { return d.source.fisheye.x ; })
            .attr("y1", function(d) { return d.source.fisheye.y ; })
            .attr("x2", function(d) { return d.target.fisheye.x ; })
            .attr("y2", function(d) { return d.target.fisheye.y ; });

        text.attr("x", function(d) { return d.fisheye.x ; })
            .attr("y", function(d) { return d.fisheye.y ; });
    });
}

// fonction pour appliquer force
function runForce(){
    force.start();
    circle.call(drag);
}


// fonction pour annuler fisheye + force
function removeAnimations(){
    //arreter force
    force.stop();
    circles.selectAll(".circle").on(".drag", null);

    // arreter fisheye
    svg.on("mousemove", function() {
        
    });
}

// fct utilisee dans force
function tick() {
    arc.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });
    circle.attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
    text.attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; });
}
