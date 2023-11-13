const  margin = {top: 50, right: 30, bottom: 75, left: 70};
const w = 1000 - margin.left - margin.right;
const h = 500 - margin.top - margin.bottom;

// Initialize svg, set width, height 
const svg = d3.select(".plot")
    .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

// Function to get data
async function getData() {
    try {
        return fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
            .then(async (response) => await response.json())
    } catch(e) {
        return e;
    }
}

(async function(){
    // Get data, set titles
    let dataset = await getData();
    let title = "Monthly Global Land-Surface Temperature";
    let yAxisTitle = "Months";
    let xAxisTitle = "Years";
    //console.log(dataset.monthlyVariance)
    
    const datasetCombined = dataset.monthlyVariance.map(data => [data.year,data.month,data.variance, new Date(data.year,data.month,1)]);

    const baseTemp = dataset.baseTemperature;
    
    let barw = w / dataset.length;

    let colorArray = ["red","green", "lightblue", "white", "orange", "gray"];
    //console.log(d3.min(datasetCombined, (d) => new Date(d[0],0)));
    // Tooltip
    const tooltip = d3.select(".plot")
        .append("g")
            .attr("id", "tooltip")
            .attr("data-year", "")
            .attr("data-xvalue", 0)
            .style("left", "0px")
            .style("visibility", "hidden");
    
    tooltip.append("div")
            .attr("class", "tooltip-text")
            .text("hidden");
    
    // Integer(1-12) to month
    const getMonth = function(data) {
        switch(data) {
            case 1:
                return "January";
            case 2:
                return "February";
            case 3:
                return "March";
            case 4:
                return "April";
            case 5:
                return "May";
            case 6:
                return "June";
            case 7:
                return "July";
            case 8:
                return "August";
            case 9:
                return "September";
            case 10:
                return "October";
            case 11:
                return "November";
            case 12:
                return "December";
            default:
                return '';
        }
    }

    // Set color for data points based on data present
    const initializeColor = function(data) {
        let temp = baseTemp + data[2];
        if (temp < 5) return colorArray[1];
        else if (temp < 7.2) return colorArray[2];
        else if (temp < 8.3) return colorArray[3];
        else if (temp < 10.6) return colorArray[4];
        else if (temp < 12.8) return colorArray[5];
        else return "black"
    }

    // Function called when moving mouse out of bar 
    const mouseout = function(data) {
        d3.select(this).style("fill", initializeColor(data));
        tooltip.style("visibility", "hidden");
    } 

    // Function called when moving mouse into bar
    const mouseover = function() {
        d3.select(this).style("fill", "rgba(200,250,250,.7)");
        tooltip.style("visibility", "visible");
    }

    // Function called when mouse moves on bar
    // Sets tooltip text and changes location
    const mousemove = function(data) {
        tooltip.attr("data-year", data[0]);
        tooltip.attr("data-month", data[1]);
        let temp = (baseTemp + data[2]).toFixed(2);
        const text = d3.select('.tooltip-text');
        text.html(`Date: ${data[1]}, ${data[0]}<br/>Temperature: ${temp}℃
        <br/>Variance: ${data[2]}℃`);
        const [x, y] = d3.mouse(this);
        tooltip.style("left", `${x+90}px`)
            .style("top", `${y-510}px`)
    };

    // Append title and y axis title
    svg.append('text')
        .attr("class", "text")
        .attr('transform', 'rotate(-90)')
        .attr('x', -250)
        .attr('y', -50)
        .style("font-size", "18px")
        .text(yAxisTitle);
        svg.append('text')
        .attr("class", "text")
        .attr('x', 450)
        .attr('y', 435)
        .style("font-size", "18px")
        .text(xAxisTitle);
    svg.append('text')
        .attr("class", "text")
        .attr("id", "title")
        .style("font-size", "25px")
        .attr('x', 150)
        .attr('y', -10)
        .text(title);

    let minDate = d3.min(datasetCombined, (d) => d[0]);
    let maxDate = d3.max(datasetCombined, (d) => d[0]);
    //console.log(minDate);
    const YearFormat = d3.utcFormat('%Y');
    const MonthFormat = d3.utcFormat('%B');
    // Create x scale, append x axis
    const x = d3.scaleBand()
        .domain(datasetCombined.map(d => d[0]))
        .range([0, w]);
    const xAxis = d3.axisBottom()
        .scale(x)
        .tickValues(x.domain().filter(d => d % 10 === 0))
        .tickFormat(function (year) {
            var date = new Date(0);
            date.setUTCFullYear(year);
            return YearFormat(date);
        })
        .tickSize(10, 1);
    svg.append("g")
        .attr("transform", "translate(0," + h + ")")
        .attr("id", "x-axis")
        .call(xAxis)
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .style("fill", "white");

    //console.log(maxMonth.getMonth());
    // Create y scale, append y axis
    const y = d3.scaleBand()
    .domain([1,2,3,4,5,6,7,8,9,10,11,12])
    .range([h, 0]);
        
    svg.append("g")
        .attr("id", "y-axis")
        .call(d3.axisLeft(y).tickFormat(function(month) {
            var date = new Date(0);
            date.setUTCMonth(month);
            return MonthFormat(date);
        }))
        .selectAll("text")
            .style("fill", "white");
    
    // Create bars, fill data points of chart
    svg.selectAll("rect")
        .data(datasetCombined)
        .enter()
        .append("rect")
            .attr("x", d => x(d[0]))
            .attr("y", d => y(d[1]))
            .attr('width', d => x.bandwidth(d[0]))
            .attr('height', d => y.bandwidth(d[1]))
            .attr("data-xvalue", d => d[0])
            .attr("data-yvalue", d => d[1])
            .attr("class", "bar")
            .attr("fill", initializeColor)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("mousemove", mousemove);

    // Create and append legend
    var threshold = d3.scaleThreshold()
        .domain([2.8,5.0,7.2,8.3,10.6,12.8])
        .range(colorArray);

    var legendScale = d3.scaleLinear()
        .domain([2.8, 12.8])
        .range([0, 240]);
    var legendAxis = d3.axisBottom(legendScale)
        .tickSize(13)
        .tickValues(threshold.domain())
        .tickFormat(d => d.toFixed(1));
        
    var g = svg.append("g");

    g.call(legendAxis)
        .attr("transform", "translate(10,445)")
        .selectAll("text")
            .style("fill", "white");;
    console.log(threshold.invertExtent("blue"));
    g.selectAll("rect")
        .data(threshold.range().map(function(color) {
            var d = threshold.invertExtent(color);
            if (d[0] == null) d[0] = legendScale.domain()[0];
            if (d[1] == null) d[1] = legendScale.domain()[1];
            return d;
        }))
        .enter()
        .append("rect")
            .attr("height", 8)
            .attr("x", function(d) { return legendScale(d[0]); })
            .attr("width", function(d) { return legendScale(d[1]) - legendScale(d[0]); })
            .attr("fill", function(d) { return threshold(d[0]); });

    g.append("text")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .attr("y", -6)
        .text("Variance from " + baseTemp + "℃")
        .style("fill", "white");
            
})();