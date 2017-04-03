 function keyGen(ip) {
    var k = "qAr0Bs1Ct2D3uE4Fv5G6wH7I8xJ9K+yL/M=zNaObPcQdReSfTgUhViWjXkYlZmnop";
    var o = "";
    var c1, c2, c3;
    var e1, e2, e3, e4;
    var i = 0;
    ip = ip.replace(/[^A-Za-z0-9+/=]/g, "");
    while (i < ip.length) {
        e1 = k.indexOf(ip.charAt(i++));
        e2 = k.indexOf(ip.charAt(i++));
        e3 = k.indexOf(ip.charAt(i++));
        e4 = k.indexOf(ip.charAt(i++));
        c1 = (e1 << 2) | (e2 >> 4);
        c2 = ((e2 & 15) << 4) | (e3 >> 2);
        c3 = ((e3 & 3) << 6) | e4;
        o = o + String.fromCharCode(c1);
        if (e3 != 64) {
            o = o + String.fromCharCode(c2);
        }
        if (e4 != 64) {
            o = o + String.fromCharCode(c3);
        }
    }
    return o;
}


module.exports = {

    keyFinder: (body) => {
    if (body.includes('var _r =')) {
        console.log('okay');
    }
    const match = RegExp(/var \_r \= \_d\(\'([^\']+)\'\)/).exec(body);
    console.log(match[0] + '\r\n' + match[1]);
    return match[1];
 },

 serviceCode: (k, origCode) => {
     console.log('serviceCode ' + k + '\r\n' + origCode + '\r\n');
    let _r = keyGen(k);
    let _rs;

    var _f = parseInt(_r.substr(0, 1));
	_r = (_f > 5 ? _f - 5 : _f + 4) + _r.substr(1);

    if (typeof (_r) == 'string')
        _rs = _r.split(',');
    var rc = '';

    console.log(_rs);

    for (var i = 0; i < _rs.length; i++) {
        rc += String.fromCharCode(((_rs[i] - i - 1) * 2) / (13 - i - 1));
    }
    const res = origCode.replace(/(.{10})$/, rc);
    console.log('result: ' + res);
    return res;
}
}

//module.exports.serviceCode('40qg30wVE=Xi30wTuUTUuzNRuzqk30BjEUXi30BiEUTUE6/Ru6qi30NU3zwp', '21ac6e96ad152e8f15a05b7350a24759b5606fa191c17e042e4d0175735f4d687feb86f6d050ef850165ede88a2bf08f0e879222c2df6c62ef846ae2776983077c991b9fbf1a964eaa5a87b142e36bc80dec22c1590e50d22088a9d2613195e881064c811d126f213f506217b5f5a910f321bf2dab731615239d07248d48b13358b0ab890675e589764bdbe6daedae5274d60412b15ce1bc6ce0fcff7341057901909ff1aea3882d');