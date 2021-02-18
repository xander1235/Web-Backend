stockType();
var colors = ["red", "green", "blue", "pink", "brown", "orange", "yellow"];
var colorsUsed = 0;
const host = "localhost";
const port = "8080";
const url = host + (port == null ? "" : ":" + port);
const baseUrl = "http://" + url;
const req = new XMLHttpRequest();

var stompClient = null;

var selectedStock = null;

function connect() {
    var socket = new WebSocket('ws://localhost:8080/trading');
    stompClient = Stomp.over(socket);  
    stompClient.connect({}, function(frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/ltp/' + selectedStock, function(messageOutput) {
            var ltpData = JSON.parse(messageOutput.body);
            //console.log("recieved", messageOutput);
            updateChart(ltpData);
        });
    }, function(error) {
        console.log("STOMP error " + error);
        setTimeout(function() {
            connect();
        }, 1000);
    });
}
            
function disconnect() {
    if(stompClient != null) {
        stompClient.disconnect();
    }
    console.log("Disconnected");
}

var chart = new CanvasJS.Chart("chartContainer", {
    title :{
        text: "Live Data"
    },
    axisX:{
        labelFormatter: function(e){
            return  CanvasJS.formatDate( e.value, "HH:mm");
        }
    },
    legend: {
        cursor: "pointer",
        verticalAlign: "top",
        horizontalAlign: "center",
        dockInsidePlotArea: true
    },
    data: []
});


function updateChart(ltpData) {
    var index = -1;
    for(i in chart.options.data) {
        if (chart.options.data[i].name === ltpData.type) {
            index = i;
            break;
        }
    }

    if (index === -1) {
        chart.options.data.push({type: "line", color: colors[colorsUsed], dataPoints: [], name: ltpData.type, showInLegend: true});
        colorsUsed++;
        index = chart.options.data.length - 1;
    }

    if (ltpData.mark) {
        chart.options.data[index].dataPoints.push({
            x: new Date(ltpData.time),
            y: ltpData.ltp,
            markerType: "square",
            markerColor: "black"
        });
    } else {
        chart.options.data[index].dataPoints.push({
            x: new Date(ltpData.time),
            y: ltpData.ltp
        });
    }
    console.log(index, chart.options.data[index]);
    chart.render();
};

function stockType() {
    let stocks = ["Day", "year", "month", "hours", "minutes", "seconds"];
    const selector = document.getElementById("stock_type");
    for(let i in stocks) {
        const option = document.createElement("option");
        option.text = stocks[i];
        option.value = stocks[i];
        selector.add(option);
    }
};

function stockChange() {
    const selector = document.getElementById("stock_type");
    console.log("selected", selector.value);
    selectedStock = selector.value;
    disconnect();
    req.open("GET", baseUrl + "/stocker/" + selectedStock, false);
    req.setRequestHeader('Accept', 'application/json');
    req.send();
    text = req.responseText;
    response = JSON.parse(text);
    console.log("response", response, response.ltp_list);
    var dt = {};
    for(i in response) {
        if (!dt.hasOwnProperty(response[i].type)) {
            dt[response[i].type] = [{
                x: new Date(response[i].time),
                y: response[i].ltp
            }];
        } else {
            dt[response[i].type].push({
                x: new Date(response[i].time),
                y: response[i].ltp
            });
        }
    }
    colorsUsed = 0;
    chart.options.title.text = selectedStock + " Data";
    chart.options.data = [];
    for(i in Object.keys(dt)) {
        chart.options.data.push({type: "line", color: colors[colorsUsed], dataPoints: dt[Object.keys(dt)[i]], name: Object.keys(dt)[i], showInLegend: true});
        colorsUsed++;
    }
    //chart.options.data.push({type: "line", color: "red", dataPoints: dt, name: typeName});
    chart.render();
    connect();
}

//chart.options.data.push({type: "line", color: "red", dataPoints: [], name: "ltp_diff"});
connect();


// function sendMessage() {
//     var from = document.getElementById('from').value;
//     var text = document.getElementById('text').value;
//     stompClient.send("/app/chat", {},
//         JSON.stringify({'from':from, 'text':text}));
// }

// function showMessageOutput(messageOutput) {
//     var response = document.getElementById('response');
//     var p = document.createElement('p');
//     p.style.wordWrap = 'break-word';
//     p.appendChild(document.createTextNode(messageOutput.from + ": "
//         + messageOutput.text + " (" + messageOutput.time + ")"));
//     response.appendChild(p);
// }


// {
//     showInLegend: true,
//         color: "green",
//     type: "line",
//     name: "ltp",
//     dataPoints: dps
// }


// function setHeaders(req) {
//     req.setRequestHeader('Content-Type', 'application/json');
//     req.setRequestHeader('Accept', 'application/json');
//     req.setRequestHeader('X-UserType', 'USER');
//     req.setRequestHeader('X-SourceID', 'WEB');
//     req.setRequestHeader('X-ClientLocalIP', 'CLIENT_LOCAL_IP');
//     req.setRequestHeader('X-ClientPublicIP', 'CLIENT_PUBLIC_IP');
//     req.setRequestHeader('X-MACAddress', 'MAC_ADDRESS');
//     req.setRequestHeader('X-PrivateKey', 'UyK3Mfqr');
//     return req;
// }