import {csv} from 'd3';

"use strict";
(function() {
  window.addEventListener('load', init);
  
  var mainData = [];
  var airportList = [];
  var flightList = [];
  var delayTimeList = [];
  var svg;

  function init() {
    const d3 = require('d3');
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
    // console.log("origin " + origin + ", destination " + dest);
    
    if (dest) {
      d3.csv(origin + '.csv')
      .then(function(data) {
        flightList = [];
        // console.log(data[0].Destination);
        // console.log("dest: " + dest);
        data.forEach(function(d) {
          if (d.Destination == dest) {
            // console.log('inside if');
            flightList.push(d);
          }
        })
        
        if (flightList.length == 0) {
          // print message
          alert("there is no available flight data for this itinerary");
        }

        // flightList.forEach(function(d) {
        //   console.log(d);
        // })
        drawDelayedBars();
      });
    }
  }

  function drawDelayedBars() {
    // MAKE LINE CHART
    //------------------------1. PREPARATION------------------------//
    //-----------------------------SVG------------------------------//
    const width = 960;
    const height = 500;
    const margin = 5;
    const padding = 5;
    const adj = 30;
    console.log('halo1');
    // we are appending SVG first
    svg = d3.select("div#container").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-"
              + adj + " -"
              + adj + " "
              + (width + adj *3) + " "
              + (height + adj*3))
        .style("padding", padding)
        .style("margin", margin)
        .classed("svg-content", true);
    console.log('halo2');
    //-----------------------------DATA-----------------------------//
    const timeConv = d3.timeParse("%d-%b-%Y");
    const dataset = d3.csv("data.csv");

    // console.log('begin');
    // flightList.forEach(function(d) {
    //   console.log(d);
    // })
    // console.log('end');

    // summarize delay time
    var delayTimeByMonth = d3.nest()
      .key(function(d) { return d.Month; })
      .rollup(function(v) { return 
        airline:
        avgDelay: d3.mean(v, function(d) { return d['Departure Delay Time (mins)']; }); 
      })
      .object(flightList);
    console.log('begin');
    console.log(delayTimeByMonth);
    console.log('end');

    // console.log(dataset);
    // d3.json(delayTimeByMonth, function(data) {
    dataset.forEach(function(data) {
      var slices = data.columns.slice(1).map(function(id) {
        return {
          id: id,
          values: data.map(function(d){
            return {
              date: timeConv(d.date),
              measurement: +d[id]
            };
          })
        };
      });
      console.log(slices);
      console.log(dataset);
    });

    // var temp = convertToCSV(delayTimeByMonth);
    // console.log(temp);
    // // temp.forEach(function(d) {
    // //   console.log(d);
    // // })

    // var headers = {
      
    // }

    exportCSVFile(headers, delayTimeByMonth, "delay-time");
      
    //----------------------------SCALES----------------------------//
    // const xScale = d3.scaleTime().range([0,width]);
    // const yScale = d3.scaleLinear().rangeRound([height, 0]);
    // xScale.domain(d3.extent(data, function(d){
    //     return timeConv(d.date)}));
    // yScale.domain([(0), d3.max(slices, function(c) {
    //     return d3.max(c.values, function(d) {
    //         return d.measurement + 4; });
    //         })
    //     ]);
      
    //-----------------------------AXES-----------------------------//
    // const yaxis = d3.axisLeft()
    //     .ticks((slices[0].values).length)
    //     .scale(yScale);
      
    // const xaxis = d3.axisBottom()
    //     .ticks(d3.timeDay.every(1))
    //     .tickFormat(d3.timeFormat('%b %d'))
    //     .scale(xScale);
      
    //----------------------------LINES-----------------------------//
    // const line = d3.line()
    //     .x(function(d) { return xScale(d.date); })
    //     .y(function(d) { return yScale(d.measurement); });

    // let id = 0;
    // const ids = function () {
    //     return "line-"+id++;
    // }  

    //---------------------------TOOLTIP----------------------------//


    //-------------------------2. DRAWING---------------------------//
    //-----------------------------AXES-----------------------------//
    // svg.append("g")
    //     .attr("class", "axis")
    //     .attr("transform", "translate(0," + height + ")")
    //     .call(xaxis);
      
    // svg.append("g")
    //     .attr("class", "axis")
    //     .call(yaxis)
    //     .append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("dy", ".75em")
    //     .attr("y", 6)
    //     .style("text-anchor", "end")
    //     .text("Frequency");
      
    //----------------------------LINES-----------------------------//
    // const lines = svg.selectAll("lines")
    //     .data(slices)
    //     .enter()
    //     .append("g");
      
    //     lines.append("path")
    //     .attr("class", ids)
    //     .attr("d", function(d) { return line(d.values); });
      
    //     lines.append("text")
    //     .attr("class","serie_label")
    //     .datum(function(d) {
    //         return {
    //             id: d.id,
    //             value: d.values[d.values.length - 1]}; })
    //     .attr("transform", function(d) {
    //             return "translate(" + (xScale(d.value.date) + 10)  
    //             + "," + (yScale(d.value.measurement) + 5 )+ ")"; })
    //     .attr("x", 5)
    //     .text(function(d) { return ("Serie ") + d.id; });

    //---------------------------POINTS-----------------------------// 

    //---------------------------EVENTS-----------------------------// 
    
    // LINE CHART END
  
  }


  function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
  }

  function exportCSVFile(headers, items, fileTitle) {
    if (headers) {
      items.unshift(headers);
    }

    // Convert Object to JSON
    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, exportedFilenmae);
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", exportedFilenmae);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  } 

  // pass in array
  // then get back array with no duplicate values
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
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