var fetch = require('node-fetch');
console.log("Update account balance!");
fetch('https://cloud.avner.us/index.php/s/kidGLOyro0YTh7Q/download',{compress: false})
.then(function(res) {
    return res.json(); 
})
.then(function(json) {
    console.log(json);
    $('#current-balance').text(json.balance + " EUR");
})
