function drawStackedArea(aid) {

  var width, height, margin, x, y, xAxis, yAxis, area, svg, dateFormat, groups, colorScale;

  var years = ["1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014"];

  var index = 0;

  var dataset = [];

  function my() {

    margin = {top: 20, right: 100, bottom: 40, left:100};

		width = fullwidth - margin.left - margin.right;
		height = fullheight - margin.top - margin.bottom;


		//Set up date formatting and years
		dateFormat = d3.time.format("%Y");

    console.log("Aid", aid);


		//Set up scales
		x = d3.time.scale()
							.range([ 0, width ]);

		y = d3.scale.linear()
							.range([ 0, height ]);

    colorScale = d3.scale.category20b();

		//Configure axis generators
		xAxis = d3.svg.axis()
						.scale(x)
						.orient("bottom")
						.ticks(15)
						.tickFormat(function(d) {
							return dateFormat(d);
						});

		yAxis = d3.svg.axis()
						.scale(y)
						.orient("left");

		//Configure area generator
		area = d3.svg.area()
			.x(function(d) {
				return x(dateFormat.parse(d.year));
			})
			.y0(height)
			.y1(function(d) {
				return y(+d.amount);
			});

		//Create the empty SVG image
		svg = d3.select(".interactive5")
					.append("svg")
					.attr("width", fullwidth)
					.attr("height", fullheight)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    makeDataSet();

    console.log("dataset", dataset);

    //Set scale domains
		x.domain(d3.extent(years, function (d) {
				return dateFormat.parse(d);
			})
		);

		y.domain([
			d3.max(dataset, function(d) {
				return d3.max(d.costs, function(d) {
					return +d.amount;
				});
			}),
			0
		]);

    return my;

  }

  my.drawMyArea = function() {

    groups = svg.selectAll("g")
					.data(dataset)
					.enter()
					.append("g");

		//Append a title with the name (so we get easy tooltips)
		groups.append("title")
			.text(function(d) {
        console.log(d);
				return d["source"];
			});

		//Within each group, create a new path,
		//binding just the data to each one
		groups.selectAll("path")
			.data(function(d) {
				return [ d["costs"] ];
			})
			.enter()
			.append("path")
			.attr("class", "area")
			.attr("d", area)
      .style("fill", function(d,i) {
        return colorScale(i);
      })
      .style("opacity", 0.1);

		//Axes
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);

    } // End drawMyArea

  function makeDataSet() {

    aid.forEach(function(d,i) {

      var data = [];

      years.forEach(function(y) {

        if (d[y]) {
          data.push({
            year: y,
            source: d["Source"],
            amount: +d[y]
          });
        }

      });

      dataset.push({
        source: d["Source"],
        costs: data
      });

    });

  } // End makeDataSet

  return my;

}
