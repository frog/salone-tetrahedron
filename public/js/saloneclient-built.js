(function (e) {
    e.fn.fullscreen = function () {
        return this.each(function () {
            this.webkitRequestFullscreen ? this.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT) : this.mozRequestFullScreen ? elem.mozRequestFullScreen() : this.requestFullscreen()
        })
    }, e.exitFullscreen = function () {
        console.log("Exiting fullscreen mode...");
        var e = document.webkitExitFullscreen || document.mozCancelFullScreen || document.exitFullscreen;
        e.call(document)
    }, e.fn.exitFullscreen = e.exitFullscreen
})(jQuery), define("jquery_fullscreen", function () {
});
var TWEEN = TWEEN || function () {
    var e = [];
    return{REVISION: "10", getAll: function () {
        return e
    }, removeAll: function () {
        e = []
    }, add: function (t) {
        e.push(t)
    }, remove: function (t) {
        t = e.indexOf(t), -1 !== t && e.splice(t, 1)
    }, update: function (t) {
        if (0 === e.length)return!1;
        for (var n = 0, r = e.length, t = void 0 !== t ? t : void 0 !== window.performance && void 0 !== window.performance.now ? window.performance.now() : Date.now(); n < r;)e[n].update(t) ? n++ : (e.splice(n, 1), r--);
        return!0
    }}
}();
TWEEN.Tween = function (e) {
    var t = {}, n = {}, r = {}, i = 1e3, s = 0, o = 0, u = null, a = TWEEN.Easing.Linear.None, f = TWEEN.Interpolation.Linear, l = [], c = null, h = !1, p = null, d = null, v;
    for (v in e)t[v] = parseFloat(e[v], 10);
    this.to = function (e, t) {
        return void 0 !== t && (i = t), n = e, this
    }, this.start = function (i) {
        TWEEN.add(this), h = !1, u = void 0 !== i ? i : void 0 !== window.performance && void 0 !== window.performance.now ? window.performance.now() : Date.now(), u += o;
        for (var s in n) {
            if (n[s]instanceof Array) {
                if (0 === n[s].length)continue;
                n[s] = [e[s]].concat(n[s])
            }
            t[s] = e[s], 0 == t[s]instanceof Array && (t[s] *= 1), r[s] = t[s] || 0
        }
        return this
    }, this.stop = function () {
        return TWEEN.remove(this), this
    }, this.delay = function (e) {
        return o = e, this
    }, this.repeat = function (e) {
        return s = e, this
    }, this.easing = function (e) {
        return a = e, this
    }, this.interpolation = function (e) {
        return f = e, this
    }, this.chain = function () {
        return l = arguments, this
    }, this.onStart = function (e) {
        return c = e, this
    }, this.onUpdate = function (e) {
        return p = e, this
    }, this.onComplete = function (e) {
        return d = e, this
    }, this.update = function (v) {
        if (v < u)return!0;
        !1 === h && (null !== c && c.call(e), h = !0);
        var m = (v - u) / i, m = 1 < m ? 1 : m, y = a(m), w;
        for (w in n) {
            var E = t[w] || 0, S = n[w];
            S instanceof Array ? e[w] = f(S, y) : ("string" == typeof S && (S = E + parseFloat(S, 10)), e[w] = E + (S - E) * y)
        }
        null !== p && p.call(e, y);
        if (1 == m) {
            if (!(0 < s)) {
                null !== d && d.call(e), m = 0;
                for (y = l.length; m < y; m++)l[m].start(v);
                return!1
            }
            isFinite(s) && s--;
            for (w in r)"string" == typeof n[w] && (r[w] += parseFloat(n[w], 10)), t[w] = r[w];
            u = v + o
        }
        return!0
    }
}, TWEEN.Easing = {Linear: {None: function (e) {
    return e
}}, Quadratic: {In: function (e) {
    return e * e
}, Out: function (e) {
    return e * (2 - e)
}, InOut: function (e) {
    return 1 > (e *= 2) ? .5 * e * e : -0.5 * (--e * (e - 2) - 1)
}}, Cubic: {In: function (e) {
    return e * e * e
}, Out: function (e) {
    return--e * e * e + 1
}, InOut: function (e) {
    return 1 > (e *= 2) ? .5 * e * e * e : .5 * ((e -= 2) * e * e + 2)
}}, Quartic: {In: function (e) {
    return e * e * e * e
}, Out: function (e) {
    return 1 - --e * e * e * e
}, InOut: function (e) {
    return 1 > (e *= 2) ? .5 * e * e * e * e : -0.5 * ((e -= 2) * e * e * e - 2)
}}, Quintic: {In: function (e) {
    return e * e * e * e * e
}, Out: function (e) {
    return--e * e * e * e * e + 1
}, InOut: function (e) {
    return 1 > (e *= 2) ? .5 * e * e * e * e * e : .5 * ((e -= 2) * e * e * e * e + 2)
}}, Sinusoidal: {In: function (e) {
    return 1 - Math.cos(e * Math.PI / 2)
}, Out: function (e) {
    return Math.sin(e * Math.PI / 2)
}, InOut: function (e) {
    return.5 * (1 - Math.cos(Math.PI * e))
}}, Exponential: {In: function (e) {
    return 0 === e ? 0 : Math.pow(1024, e - 1)
}, Out: function (e) {
    return 1 === e ? 1 : 1 - Math.pow(2, -10 * e)
}, InOut: function (e) {
    return 0 === e ? 0 : 1 === e ? 1 : 1 > (e *= 2) ? .5 * Math.pow(1024, e - 1) : .5 * (-Math.pow(2, -10 * (e - 1)) + 2)
}}, Circular: {In: function (e) {
    return 1 - Math.sqrt(1 - e * e)
}, Out: function (e) {
    return Math.sqrt(1 - --e * e)
}, InOut: function (e) {
    return 1 > (e *= 2) ? -0.5 * (Math.sqrt(1 - e * e) - 1) : .5 * (Math.sqrt(1 - (e -= 2) * e) + 1)
}}, Elastic: {In: function (e) {
    var t, n = .1;
    return 0 === e ? 0 : 1 === e ? 1 : (!n || 1 > n ? (n = 1, t = .1) : t = .4 * Math.asin(1 / n) / (2 * Math.PI), -(n * Math.pow(2, 10 * (e -= 1)) * Math.sin((e - t) * 2 * Math.PI / .4)))
}, Out: function (e) {
    var t, n = .1;
    return 0 === e ? 0 : 1 === e ? 1 : (!n || 1 > n ? (n = 1, t = .1) : t = .4 * Math.asin(1 / n) / (2 * Math.PI), n * Math.pow(2, -10 * e) * Math.sin((e - t) * 2 * Math.PI / .4) + 1)
}, InOut: function (e) {
    var t, n = .1;
    return 0 === e ? 0 : 1 === e ? 1 : (!n || 1 > n ? (n = 1, t = .1) : t = .4 * Math.asin(1 / n) / (2 * Math.PI), 1 > (e *= 2) ? -0.5 * n * Math.pow(2, 10 * (e -= 1)) * Math.sin((e - t) * 2 * Math.PI / .4) : .5 * n * Math.pow(2, -10 * (e -= 1)) * Math.sin((e - t) * 2 * Math.PI / .4) + 1)
}}, Back: {In: function (e) {
    return e * e * (2.70158 * e - 1.70158)
}, Out: function (e) {
    return--e * e * (2.70158 * e + 1.70158) + 1
}, InOut: function (e) {
    return 1 > (e *= 2) ? .5 * e * e * (3.5949095 * e - 2.5949095) : .5 * ((e -= 2) * e * (3.5949095 * e + 2.5949095) + 2)
}}, Bounce: {In: function (e) {
    return 1 - TWEEN.Easing.Bounce.Out(1 - e)
}, Out: function (e) {
    return e < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + .75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + .9375 : 7.5625 * (e -= 2.625 / 2.75) * e + .984375
}, InOut: function (e) {
    return.5 > e ? .5 * TWEEN.Easing.Bounce.In(2 * e) : .5 * TWEEN.Easing.Bounce.Out(2 * e - 1) + .5
}}}, TWEEN.Interpolation = {Linear: function (e, t) {
    var n = e.length - 1, r = n * t, i = Math.floor(r), s = TWEEN.Interpolation.Utils.Linear;
    return 0 > t ? s(e[0], e[1], r) : 1 < t ? s(e[n], e[n - 1], n - r) : s(e[i], e[i + 1 > n ? n : i + 1], r - i)
}, Bezier: function (e, t) {
    var n = 0, r = e.length - 1, i = Math.pow, s = TWEEN.Interpolation.Utils.Bernstein, o;
    for (o = 0; o <= r; o++)n += i(1 - t, r - o) * i(t, o) * e[o] * s(r, o);
    return n
}, CatmullRom: function (e, t) {
    var n = e.length - 1, r = n * t, i = Math.floor(r), s = TWEEN.Interpolation.Utils.CatmullRom;
    return e[0] === e[n] ? (0 > t && (i = Math.floor(r = n * (1 + t))), s(e[(i - 1 + n) % n], e[i], e[(i + 1) % n], e[(i + 2) % n], r - i)) : 0 > t ? e[0] - (s(e[0], e[0], e[1], e[1], -r) - e[0]) : 1 < t ? e[n] - (s(e[n], e[n], e[n - 1], e[n - 1], r - n) - e[n]) : s(e[i ? i - 1 : 0], e[i], e[n < i + 1 ? n : i + 1], e[n < i + 2 ? n : i + 2], r - i)
}, Utils: {Linear: function (e, t, n) {
    return(t - e) * n + e
}, Bernstein: function (e, t) {
    var n = TWEEN.Interpolation.Utils.Factorial;
    return n(e) / n(t) / n(e - t)
}, Factorial: function () {
    var e = [1];
    return function (t) {
        var n = 1, r;
        if (e[t])return e[t];
        for (r = t; 1 < r; r--)n *= r;
        return e[t] = n
    }
}(), CatmullRom: function (e, t, n, r, i) {
    var e = .5 * (n - e), r = .5 * (r - t), s = i * i;
    return(2 * t - 2 * n + e + r) * i * s + (-3 * t + 3 * n - 2 * e - r) * s + e * i + t
}}}, define("tween", function () {
}), define("tetralogo", ["three", "stats", "jquery_fullscreen", "tween", "socket.io"], function () {
    function g() {
        u = E().width, a = E().height, f = a / 2, t = new THREE.Scene, e = new THREE.OrthographicCamera(u / -2, u / 2, a / 2, a / -2, -2e3, 2e3), e.position.z = 1e3, t.add(e), r = new THREE.TetrahedronGeometry(f), i = new THREE.MeshBasicMaterial({color: 16577429, wireframe: !0, wireframeLinewidth: 8, side: THREE.DoubleSide}), s = new THREE.Mesh(r, i), t.add(s), n = new THREE.WebGLRenderer, n.setSize(u, a), $("#tetralogo").append(n.domElement), n.render(t, e)
    }

    function y() {
        TWEEN.removeAll();
        var e = function () {
            s.position.x = t.x, s.rotation.x += o, s.rotation.y += v
        };
        l = {x: 1, y: a / 2}, c = {x: u, y: a / 2}, console.log("screenStartPosition: ", l), console.log("screenEndPosition: ", c), h = S(l), p = S(c), d = p.x, h.x -= f * 1.1, p.x += f * 1.1;
        var t = h, n = TWEEN.Easing.Linear.None, r = 0, i = 3e3, o = .02, v = .05, m = (new TWEEN.Tween(t)).to({x: p.x}, i).easing(n).delay(r).onUpdate(e), g = (new TWEEN.Tween(t)).to({x: h.x}, 0).delay(r).easing(n).onUpdate(e);
        m.start()
    }

    function b() {
        o == 0 && (requestAnimationFrame(b), TWEEN.update(), T.update(), w(), s.position.x >= d ? v == 0 && (console.log("TRIGGER NEXT WINDOW", s.position.x, s.position.y, s.rotation.x, s.rotation.y), v = !0, m.emit("startnext", {posx: s.position.x, posy: s.position.y, rotx: s.rotation.x, roty: s.rotation.y})) : v == 1 && (v = !1))
    }

    function w() {
        n.render(t, e)
    }

    function E() {
        var e = window, t = "inner";
        return"innerWidth"in window || (t = "client", e = document.documentElement || document.body), {width: e[t + "Width"], height: e[t + "Height"]}
    }

    function S(t) {
        var r = n.domElement, i = r.getBoundingClientRect(), s = (t.x - i.left) * (r.width / i.width), o = (t.y - i.top) * (r.height / i.height), f = new THREE.Vector3(t.x / u * 2 - 1, -(t.y / a) * 2 + 1, .5), l = new THREE.Projector;
        l.unprojectVector(f, e);
        var c = f.sub(e.position).normalize(), h = new THREE.Ray(e.position, c), p = -e.position.z / c.z;
        return e.position.clone().add(c.multiplyScalar(p))
    }

    function x() {
        u = E().width, a = E().height, n.setSize(u, a), e.left = u / -2, e.right = u / 2, e.top = a / 2, e.bottom = a / -2, e.updateProjectionMatrix(), y()
    }

    var e, t, n, r, i, s, o = !1, u = E().width, a = E().height, f = a / 2, l, c, h, p, d, v = !1, m = io.connect();
    m.on("start", function (e) {
        console.log("received start event with data", e), y(), s.rotation.x = e.rotx, s.rotation.y = e.roty
    }), window.onresize = function (e) {
        console.log("onresize"), x()
    }, window.onclick = function (e) {
        o == 1 ? (o = !1, b()) : o = !0, console.log(o)
    }, document.addEventListener("keydown", function (e) {
        switch (e.keyCode) {
            case 13:
                e.preventDefault(), $.exitFullscreen();
                break;
            case 70:
                $("body").fullscreen(), g();
                break;
            case 83:
                $(T.domElement).toggle()
        }
    }, !1);
    var T = new Stats;
    T.domElement.style.position = "absolute", $("#tetralogo").append(T.domElement), g(), b()
}), define("saloneclient", ["socket.io", "tetralogo"], function (e, t) {
    $(document).ready(function () {
        console.log("Document ready"), $(".config").hover(function () {
            $(this).fadeTo(1, 1)
        }, function () {
            $(this).fadeTo(1, 0)
        }), $("#configform").submit(function () {
            var t = $(".row").val(), n = $(".column").val();
            return e.emit("config", {row: t, column: n}), !1
        });
        var e = io.connect();
        e.on("update", function (e) {
            $("body").css("background-color", e.bgcolor)
        }), e.on("position", function (e) {
            $("#currentpos").html("Current row no: " + e.row + "<br>Current row sequence no: " + e.column + "<br><br>")
        })
    })
    alert('built!');
});