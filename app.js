const  margin = {top: 50, right: 30, bottom: 80, left: 70};
const w = 1000 - margin.left - margin.right;
const h = 550 - margin.top - margin.bottom;

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
    
    const datasetCombined = dataset.monthlyVariance.map(data => [data.year,data.month-1,data.variance, new Date(data.year,data.month,1)]);

    const baseTemp = dataset.baseTemperature;
    
    // Arrays for determining heatmap color
    let tempNumArray = [2.8,3.6,4.3,5.1,5.9,6.7,7.4,8.2,9,9.7,10.5,11.3,12,12.8];
    let colorArray = ["rgb(50,50,250)", "rgb(70,70,250)", "rgb(100,100,250)", "rgb(130,130,250)", "rgb(160,160,250)", "rgb(195,195,250)", "rgb(230,230,250)"
    ,"rgb(250,250,250", "rgb(250,230,230)", "rgb(250,195,195)", "rgb(250,160,160)", "rgb(250,130,130)", "rgb(250,100,100)", "rgb(250,70,70)"];
    
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
            case 0:
                return "January";
            case 1:
                return "February";
            case 2:
                return "March";
            case 3:
                return "April";
            case 4:
                return "May";
            case 5:
                return "June";
            case 6:
                return "July";
            case 7:
                return "August";
            case 8:
                return "September";
            case 9:
                return "October";
            case 10:
                return "November";
            case 11:
                return "December";
            default:
                return '';
        }
    }

    // Set color for data points based on data present
    const initializeColor = function(data) {
        let temp = baseTemp + data[2];
        if (temp < tempNumArray[0]) return colorArray[0];
        else if (temp < tempNumArray[1]) return colorArray[1];
        else if (temp < tempNumArray[2]) return colorArray[2];
        else if (temp < tempNumArray[3]) return colorArray[3];
        else if (temp < tempNumArray[4]) return colorArray[4];
        else if (temp < tempNumArray[5]) return colorArray[5];
        else if (temp < tempNumArray[6]) return colorArray[6];
        else if (temp < tempNumArray[7]) return colorArray[7];
        else if (temp < tempNumArray[8]) return colorArray[8];
        else if (temp < tempNumArray[9]) return colorArray[9];
        else if (temp < tempNumArray[10]) return colorArray[10];
        else if (temp < tempNumArray[11]) return colorArray[11];
        else if (temp < tempNumArray[12]) return colorArray[12];
        else return "rgb(250,50,50)"
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
        text.html(`Date: ${getMonth(data[1])}, ${data[0]}<br/>Temperature: ${temp}℃
        <br/>Variance: ${data[2]}℃`);
        const [x, y] = d3.mouse(this);
        tooltip.style("left", `${x+90}px`)
            .style("top", `${y-510}px`)
    };

    // Append title and x/y axis title
    svg.append('text')
        .attr("class", "text")
        .attr('transform', 'rotate(-90)')
        .attr('x', -250)
        .attr('y', -50)
        .style("font-size", "18px")
        .text(yAxisTitle);
        svg.append('text')
        .attr("class", "text")
        .attr('x', 490)
        .attr('y', 475)
        .style("font-size", "18px")
        .text(xAxisTitle);
    svg.append('text')
        .attr("class", "text")
        .attr("id", "title")
        .style("font-size", "25px")
        .attr('x', 150)
        .attr('y', -10)
        .text(title);

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

    // Create y scale, append y axis
    const y = d3.scaleBand()
    .domain([0,1,2,3,4,5,6,7,8,9,10,11])
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
            .attr("data-year", d => d[0])
            .attr("data-month", d => d[1])
            .attr("data-temp", d => d[2])
            .attr("class", "cell")
            .attr("fill", initializeColor)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("mousemove", mousemove);

    // Create and append legend
    var threshold = d3.scaleThreshold()
        .domain(tempNumArray)
        .range(colorArray);

    var legendScale = d3.scaleLinear()
        .domain([2.8, 12.8])
        .range([0, 350]);
    var legendAxis = d3.axisBottom(legendScale)
        .tickSize(13)
        .tickValues(threshold.domain())
        .tickFormat(d => d.toFixed(1));
        
    var g = svg.append("g");
    // Data text at bottom of legend
    g.call(legendAxis)
        .attr("transform", "translate(10,475)")
        .attr("id", "legend")
        .selectAll("text")
            .style("fill", "white");;
    
    // Colors in legend
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

    // Legend description
    g.append("text")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .attr("y", -6)
        .text("Variance from " + baseTemp + "℃")
        .style("fill", "white");
            
})();