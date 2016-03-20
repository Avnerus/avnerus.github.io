var fetch = require('node-fetch');
console.log("Update account balance!");
fetch('https://dl.dropboxusercontent.com/s/qawpeqy0v44agrz/balance.json?dl=1')
.then(function(res) {
    return res.json(); 
})
.then(function(json) {
    console.log(json);
    $('#current-balance').text(json.balance + " EUR");
})
