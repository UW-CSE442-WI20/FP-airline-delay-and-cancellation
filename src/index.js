import {csv} from 'd3';

"use strict";
(function() {
  window.addEventListener('load', init);
  
  var mainData = [];
  var airportList = [];
  var flightList = [];
  var svg;

  function init() {
    const d3 = require('d3');

    // initialize svg
    var margin = {top: 40, right: 20, bottom: 60, left: 130};
    var width = 1100 - margin.left - margin.right;
    var height = 700 - margin.top - margin.bottom;

    svg = d3.select('body').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + "," + margin.top + ')');

    loadAirportData();
    
    // for search bars
    autocomplete(document.getElementById("originInput"), airportList);
    autocomplete(document.getElementById("destInput"), airportList);
  }
  
  // LOAD ORIGIN DATA
  function loadAirportData() {
    d3.csv('airport_list.csv').then(function(data) {
      data.forEach(function(d) {
        airportList.push(d.City + ' (' + d.Airport + ')');
      })
    })
  }

  // GET ORIGIN AND DESTINATION INPUT
  // and then load the flight data by origin
  // once the origin has been chosen
  function loadFlightData() {
    var origin = document.getElementById('originInput').value;
    var dest = document.getElementById('destInput').value;

    origin = origin.substring(origin.length - 4, origin.length - 1);
    dest = dest.substring(dest.length - 4, dest.length - 1);
    console.log("origin " + origin + ", destination " + dest);
    
    if (dest) {
      d3.csv(origin + '.csv')
      .then(function(data) {
        flightList = [];
        //console.log(data[0].Destination);
        //console.log("dest: " + dest);
        data.forEach(function(d) {
          if (d.Destination == dest) {
            //console.log('inside if');
            flightList.push(d);
          }
        })
        
        if (flightList.length == 0) {
          // print message
          // "there is no available flight data for this itinerary"
          console.log("no flight");
        }

        flightList.forEach(function(d) {
          //console.log(d);
        })
        drawCancel("");
      });
    }

  }

  // pass in array
  // then get back array with no duplicate values
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  // Cancellation Pie Chart
  function drawCancel(airline) {
    //console.log("here");
    var airlineName = 'SkyWest Airlines Inc. ';
    var total = 0, carrier = 0, weather = 0, nationalAir = 0, security = 0;
    // Delete old svg before drawing a new one
    d3.select("svg").remove();
    d3.selectAll("svg > *").remove();
    if (flightList.length != 0) {
    flightList.forEach(function(d) {
        if (d.Airline == airlineName) {
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


//   console.log("Airline" + carrier);
//   console.log("Weather" + weather);
//   console.log("National" + nationalAir);
//   console.log("Security" + security);
//   console.log("Total" + total);
   // set the dimensions and margins of the graph
   var width = 450,
       height = 450,
       margin = 40;

   // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
   var radius = Math.min(width, height) / 2 - margin;

   // append the svg object to the div called 'my_dataviz'
   var svg = d3.select("#cancellation")
     .append("svg")
       .attr("width", width)
       .attr("height", height)
     .append("g")
       .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

   // Create dummy data
   //var data = {a: 9, b: 20, c:30, d:8, e:12}
   var data = {'Airline' : carrier, 'Weather': weather, 'National Air System': nationalAir, 'Security': security}

   // set the color scale
   var color = d3.scaleOrdinal()
     .domain(data)
     .range(d3.schemeSet2);
   // Compute the position of each group on the pie:
   var pie = d3.pie()
     .value(function(d) {return d.value; })
   var data_ready = pie(d3.entries(data))
   // Now I know that group A goes from 0 degrees to x degrees and so on.

   // shape helper to build arcs:
   var arcGenerator = d3.arc()
     .innerRadius(radius - radius/3)
     .outerRadius(radius)

   // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
   svg
     .selectAll('mySlices')
     .data(data_ready)
     .enter()
     .append('path')
       .attr('d', arcGenerator)
       .attr('fill', function(d){ return(color(d.data.key)) })
       .attr("stroke", "black")
       .style("stroke-width", "2px")
       .style("opacity", 0.7)

   // Now add the annotation. Use the centroid method to get the best coordinates
   svg
     .selectAll('mySlices')
     .data(data_ready)
     .enter()
     .append('text')
     .text(function(d){ if(d.data.value != 0) return d.data.key})
     .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
     .style("text-anchor", "middle")
     .style("font-size", 17)
     } else {
        //document.write("no flight");
     }
  }

  // AUTOCOMPLETE SEARCH FIELD ***********************************************
  function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                loadFlightData();
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
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