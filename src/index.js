import { csv } from 'd3';

"use strict";
(function () {
  window.addEventListener('load', init);

  var airlineColors = [
    {
      airline: "Endeavor",
      color: '#020F28'
    },
    {
      airline: "American",
      color: '#178AC5'
    },
    {
      airline: "Alaska",
      color: '#01426A'
    },
    {
      airline: "JetBlue",
      color: '#8DC6E8'
    },
    {
      airline: "Delta",
      color: '#E01933'
    },
    {
      airline: "ExpressJet",
      color: '#990602'
    },
    {
      airline: "Frontier",
      color: '#006643'
    },
    {
      airline: "Allegiant",
      color: '#FBCE20'
    },
    {
      airline: "Hawaiian",
      color: '#932E89'
    },
    {
      airline: "Envoy",
      color: '#AF1E2D'
    },
    {
      airline: "Spirit",
      color: '#FFEC00'
    },
    {
      airline: "PSA",
      color: '#3F99C7'
    },
    {
      airline: "SkyWest",
      color: '#00529B'
    },
    {
      airline: "United",
      color: '#1D589C'
    },
    {
      airline: "Virgin",
      color: '#E1163C'
    },
    {
      airline: "Southwest",
      color: '#FFBF27'
    },
    {
      airline: "Mesa",
      color: '#000000'
    },
    {
      airline: "Republic",
      color: '#BCBDC0'
    },
  ]

  // console.log(airlineColors.find(hi));
  //
  // function hi(item) {
  //   console.log(item)
  //   if (item !== undefined && "Alaska Airlines Inc. ".includes(item.airline)) {
  //     return item;
  //   }
  // }


  var airportList = []; // initial airport list (everything)
  var flightList = [];  // only one origin, multiple dests
  var airlineUnique = []; // get airline
  var destList = []; // only dest airports (after origin is chosen)
  var flightFiltered = []; // one origin, one dest
  var minMean = 1000000;
  var maxMean = -1000000;

  function init() {
    const d3 = require('d3');
    const fuzzysort = require('fuzzysort');

    loadAirportData();

    // for search bars
    autocomplete(document.getElementById("originInput"), airportList);
  }

  function showData(id) {
    document.getElementById(id).classList.remove("hidden");
  }

  function hideData(id) {
    document.getElementById(id).classList.add("hidden");
  }

  function getColor(item) {
    if ("Alaska Airlines Inc. ".includes(item.airline)) {
      return item.color;
    }
  }

  // load origin airport data
  function loadAirportData() {
    d3.csv('airportList.csv').then(function (data) {
      data.forEach(function (d) {
        airportList.push(d.City + ' (' + d.Airport + ')');
      })
    })
  }

  function loadOrigin() {
    var origin = document.getElementById('originInput').value;
    var ori = origin.substring(origin.length - 4, origin.length - 1);
    // console.log('origin ' + ori);

    d3.csv(ori + '.csv')
    .then(function (d) {
      // console.log('loading');
      var dests = [];
      destList = [];
      flightList = [];
      d.forEach(function (e) {
        dests.push(e.Destination);
        flightList.push(e);
      })
      dests = [...new Set(dests)];

      airportList.forEach(function (e) {
        dests.forEach(function (f) {
          var temp = e.substring(e.length - 4, e.length - 1);
          if (f === temp) {
            // console.log('here');
            destList.push(e);
          }
        })
      })

      // console.log('begin');
      // console.log(destList);
      // console.log('end');
      autocomplete(document.getElementById("destInput"), destList);
    })
  }

  function loadDestination() {
    var dest = document.getElementById('destInput').value;
    dest = dest.substring(dest.length - 4, dest.length - 1);
    // console.log(dest);
    // console.log(flightList[0]);

    flightFiltered = [];
    flightList.forEach(function (d) {
      if (d.Destination === dest) {
        flightFiltered.push(d);
      }
    })

    // Delete old svg before drawing a new one
    d3.selectAll("#line-chart").remove();
    d3.selectAll("#pie-chart").remove();
    d3.selectAll("#bar-chart").remove();
    drawDelayedBars();
  }

  // drawing main line graph
  function drawDelayedBars() {
    showData("averageSection");
    // console.log('drawing...');
    var flightYear = [];
    var airlines = [];
    // include all the flights after year filter has been set
    flightFiltered.forEach(function (d) {
      flightYear.push(d);
      airlines.push(d.Airline);
    })

    // get all the airlines
    airlineUnique = [...new Set(airlines)];

    airlineUnique.forEach(function (d) {
      var mean = getMean(d, flightYear);
      // minMean = Math.min(minMean, )
      mean.forEach(function(d) {
        // console.log(+d.mean);
        minMean = Math.min(+minMean, +d.mean);
        maxMean = Math.max(+maxMean, +d.mean);
      })
    })

    // SET UP SVG
    var margin = { top: 50, right: 35, bottom: 50, left: 50 },
      w = 630 - (margin.left + margin.right),
      h = 500 - (margin.top + margin.bottom);

    var x = d3.scaleLinear()
      .domain([1, 12])
      .rangeRound([0, w]);

    var y = d3.scaleLinear()
      .domain([minMean - 10, maxMean + 10])
      .range([h, 0]);

    var xAxis = d3.axisBottom(x)
      .ticks(10);

    var yAxis = d3.axisLeft(y)
      .ticks(10);

    var xGrid = d3.axisBottom(x)
      .ticks(5)
      .tickSize(-h, 0, 0)
      .tickFormat('');

    var yGrid = d3.axisLeft(y)
      .ticks(2)
      .tickSize(-w, 0, 0)
      .tickFormat('');

    var svg = d3.select('#chart').append('svg')
      .attr("id", "line-chart")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('g')
      .attr('class', 'x axes')
      .attr('transform', 'translate(0,' + h + ')')
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y axes')
      .call(yAxis);

    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(0,' + h + ')')
      .call(xGrid);

    svg.append('g')
      .attr('class', 'y-grid')
      .call(yGrid);

    airlineUnique.forEach(function (d) {
      var mean = getMean(d, flightYear);
      plotLine(mean, d);
    })

    function plotLine(mean_data, cirClass) {
      var line = d3.line()
        .curve(d3.curveCardinal)
        .x(function (d) {
          return x(d.month);
        })
        .y(function (d) {
          return y(d.mean);
        });

      var tooltip = d3.select('#chart')
        .append('div')
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('visibility', 'hidden')
        .text('');

      svg.append('path')
        .datum(mean_data)
        .attr('class', 'line')
        .attr('d', line)
        .attr('stroke', airlineColors.find(function (item) {
            if (item !== undefined && mean_data[0].airline.includes(item.airline)) {
              return item;
            }
          }).color
        );

      svg.selectAll('.dot')
        .data(mean_data)
        .enter().append('circle')
        .attr('class', cirClass)
        .attr('cy', function (d) {
          return y(d.mean);
        })
        .attr('cx', function (d, i) {
          return x(d.month);
        })
        .attr('r', 4)
        .style('fill', airlineColors.find(function (item) {
          if (item !== undefined && mean_data[0].airline.includes(item.airline)) {
            return item;
          }
        }).color)
        .on('mouseover', function (d) {
          d3.selectAll("#pie-chart").remove();
          d3.selectAll("#bar-chart").remove();
          drawCancel(d.airline, mean_data);
          drawNumberDelays(d.airline);
          return tooltip.style('visibility', 'visible').text(d.airline);
        })
        .on('mousemove', function () {
          return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function () {
          return tooltip.style('visibility', 'hidden');
        });

      svg.selectAll(".line")
        .data(mean_data)
        .on('mouseover', function (d) {
          // console.log(mean_data);
          // console.log(d);
          // console.log(d.airline);
          const selection = d3.select(this).raise();
          selection
            .transition()
            .delay("100")
            .duration("10")
            .style("stroke", "#steelblue")
            .style("opacity", "1")
            .style("stroke-width", "4");
          // d3.selectAll("#pie-chart").remove();
          // d3.selectAll("#bar-chart").remove();
          // drawCancel(d.airline, mean_data);
          // drawNumberDelays(d.airline);
          // return tooltip.style('visibility', 'visible').text(d.airline);
        })
        // .on('mousemove', function () {
        //   return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
        // })
        .on('mouseout', function () {
          const selection = d3.select(this)
          selection
            .transition()
            .delay("100")
            .duration("10")
            // .style("stroke","steelblue")
            .style("opacity","0.3")
            .style("stroke-width","3");
          // return tooltip.style('visibility', 'hidden');
        });
    }

    function drawList(mean_data) {
      var a = document.createElement("DIV");
      a.setAttribute("id", "mean-list");
      a.setAttribute("class", "mean-items");
    
    }
  }

  function getMean(airline, flightYear) {
    var mean = [];
    for (var i = 0; i < 12; i++) {
      var count = 0;
      var total = 0;
      var j = 0;

      flightYear.forEach(function (d) {
        j++;
        if (+d.Month === +(i + 1) && !isNaN(+d['Departure Delay Time (mins)']) && d.Airline === airline) {
          count++;
          total += +d['Departure Delay Time (mins)'];
        }
      })

      var temp = { airline: airline, month: (i + 1), mean: (total / count) };
      if (!isNaN(temp.mean)) {
        mean.push(temp);
      }
    }
    return mean;
  }

  // Cancellation Pie Chart
  function drawCancel(airline, mean) {
    showData("cancellationSection");
    var total = 0, carrier = 0, weather = 0, nationalAir = 0, security = 0;
    var x = document.getElementById("no-cancel");
    if (flightList.length != 0) {
      flightList.forEach(function (d) {
        if (d.Airline == airline) {
          total++;
          if (d['Flight Cancellation'] == 1) {
            if (d['Cancellation Reason'] == 'Airline')
              carrier++;
            if (d['Cancellation Reason'] == 'Weather')
              weather++;
            if (d['Cancellation Reason'] == 'National Air System')
              nationalAir++;
            if (d['Cancellation Reason'] == 'Security')
              security++;
          }
        }
      });
      var totalCan = carrier + weather + nationalAir + security;
      // set the dimensions and margins of the graph
      var width = 450,
        height = 450,
        margin = 40;

      // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
      var radius = Math.min(width, height) / 2 - margin;

      // append the svg object to the div called 'cancellation'
      var svg = d3.select("#cancellation")
        .append("svg")
        .attr("id", "pie-chart")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var data = { 'Airline': carrier, 'Weather': weather, 'National Air System': nationalAir, 'Security': security }

      // set the color scale
      var color = d3.scaleOrdinal()
        .domain(data)
        .range(d3.schemeTableau10);
      // Compute the position of each group on the pie:
      var pie = d3.pie()
        .value(function (d) { return d.value; })
      var data_ready = pie(d3.entries(data))
      // Now I know that group A goes from 0 degrees to x degrees and so on.

      // shape helper to build arcs:
      var arcGenerator = d3.arc()
        .innerRadius(radius - radius / 3)
        .outerRadius(radius)

      // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
      if (totalCan != 0) {
        x.style.display = "none";
        svg
          .selectAll('mySlices')
          .data(data_ready)
          .enter()
          .append('path')
          .attr('d', arcGenerator)
          .attr('fill', function (d) { return (color(d.data.key)) })
          .attr("stroke", "black")
          .style("stroke-width", "2px")
          .style("opacity", 0.7)

        // Now add the annotation. Use the centroid method to get the best coordinates
        svg
          .selectAll('mySlices')
          .data(data_ready)
          .enter()
          .append('text')
          .text(function (d) { if (d.data.value != 0) return d.data.key })
          .attr("transform", function (d) { return "translate(" + arcGenerator.centroid(d) + ")"; })
          .style("text-anchor", "middle")
          .style("font-size", 17)
      } else {
        x.style.display = "block";
      }
    }
  }

  // draw bar graph
  function drawNumberDelays(airline) {
    showData("delaysSection");
    var delayedByAirline = [];
    flightFiltered.forEach(function (d) {
      if (d.Airline === airline && d["Departure Delay Time (mins)"] > 0) {
        delayedByAirline.push(d);
      }
    })

    var countArr = new Array(24);
    for (var i = 0; i < 24; i++) {
      countArr[i] = 0;
    }

    delayedByAirline.forEach(function (d) {
      countArr[Math.floor(d["Scheduled Departure Time"] / 100)]++;
    })

    var countByTime = [];
    for (var i = 0; i < 24; i++) {
      var temp = { time: i, count: countArr[i] };
      countByTime.push(temp);
    }
    // console.log(airline);
    // console.log(countByTime);

    // set the dimensions and margins of the graph
    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);
    var y = d3.scaleLinear()
      .range([height, 0]);

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#delays").append("svg")
      .attr("id", "bar-chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 10)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


    // Scale the range of the data in the domains
    x.domain(countByTime.map(function (d) { return d.time; }));
    y.domain([0, d3.max(countByTime, function (d) { return d.count + 10; })]);

    // add the x Axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
    // text label for the x axis
    svg.append("text")
      .attr("transform",
        "translate(" + (width / 2) + " ," +
        (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Hour")

    // add the y Axis
    svg.append("g")
      .call(d3.axisLeft(y));

    // text label for the y axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Number of Delayed Flights");

    var greyColor = "#898989";
    var barColor = "#BB998C";
    var highlightColor = "#EEC9BC";

    svg.selectAll(".bar")
      .data(countByTime)
      .enter().append("rect")
      .attr("class", "bar")
      .style("display", d => { return d.count === 0 ? "none" : null; })
      .style("fill", d => {
        return d.count === d3.max(countByTime, d => { return d.count; })
          ? highlightColor : barColor
      })
      .attr("x", d => { return x(d.time); })
      .attr("width", x.bandwidth())
      .attr("y", d => { return height; })
      .attr("height", 0)
      .transition()
      .duration(750)
      .delay(function (d, i) {
        return i * 150;
      })
      .attr("y", d => { return y(d.count); })
      .attr("height", d => { return height - y(d.count); });

    svg.selectAll(".label")
      .data(countByTime)
      .enter()
      .append("text")
      .attr("class", "label")
      .style("display", d => { return d.count === 0 ? "none" : null; })
      .attr("x", (d => { return x(d.time) + (x.bandwidth() / 2) - 10; }))
      .style("fill", d => {
        return d.count === d3.max(countByTime, d => { return d.count; })
          ? highlightColor : greyColor
      })
      .attr("y", d => { return height; })
      .attr("height", 0)
      .transition()
      .duration(750)
      .delay((d, i) => { return i * 150; })
      .text(d => { return d.count; })
      .attr("y", d => { return y(d.count) + .1; })
      .attr("dy", "-.7em");
  };

  // AUTOCOMPLETE SEARCH FIELD ***********************************************
  function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false; }
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);

      // ----- ORIGINAL CODE
      /*for each item in the array...*/
      // for (i = 0; i < arr.length; i++) {
      //   /*check if the item starts with the same letters as the text field value:*/
      //   if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
      //     /*create a DIV element for each matching element:*/
      //     b = document.createElement("DIV");
      //     /*make the matching letters bold:*/
      //     b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
      //     b.innerHTML += arr[i].substr(val.length);
      //     /*insert a input field that will hold the current array item's value:*/
      //     b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
      //     /*execute a function when someone clicks on the item value (DIV element):*/
      //     b.addEventListener("click", function(e) {
      //         /*insert the value for the autocomplete text field:*/
      //         inp.value = this.getElementsByTagName("input")[0].value;
      //         loadFlightData();
      //         /*close the list of autocompleted values,
      //         (or any other open lists of autocompleted values:*/
      //         closeAllLists();
      //     });
      //     a.appendChild(b);
      //   }
      // }
      // ----- END ORIGINAL CODE

      // ----- FROM HERE, Alicia changed the method for searching to fuzzy
      // instead of only looking the first few characters
      // so people can search using the code too
      const results = fuzzysort.go(val, arr);
      // console.log('begin');
      // console.log(results);
      // console.log('end');

      results.forEach(function (d) {
        b = document.createElement("DIV");
        b.innerHTML = d.target;
        b.innerHTML += "<input type='hidden' value='" + d.target + "'>";
        b.addEventListener('click', function (e) {
          inp.value = this.getElementsByTagName("input")[0].value;

          if (inp === document.getElementById("originInput")) {
            loadOrigin();
          } else {
            loadDestination();
          }
          closeAllLists();
        })
        a.appendChild(b);
      })

      // ----- TO HERE
    });

    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");

      if (e.keyCode == 8) {
        if (inp === document.getElementById("originInput")) {
          document.getElementById("destInput").value = '';
        }
      }
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
      closeAllLists(e.target);
    });
  }
  // END AUTOCOMPLETE SEARCH FIELD *******************************************
})();