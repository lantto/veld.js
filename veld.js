;(function(window, document, Math, undefined) {

'use strict';

/**********************************
 * SHIMS
 **********************************/

var requestAnimFrame = (function(){
    return window.requestAnimationFrame 
           || window.webkitRequestAnimationFrame
           || window.mozRequestAnimationFrame
           || window.oRequestAnimationFrame 
           || window.msRequestAnimationFrame
           || function(callback, element){ window.setTimeout(callback, 1000 / 60); };
})();

/**********************************
 * "CLASSES"
 **********************************/

var Entity = (function() {
    function Entity(x, y, direction) {
        this.x = x || 0;
        this.y = y || 0;
        this.direction = direction || 180;
        
        this.speed = 1;
    }

    Entity.prototype.update = function(dt) {
        var velocity = calculateVelocity(this.direction, this.speed);
        this.x += velocity.x * dt;
        this.y += velocity.y * dt;
    }

    Entity.prototype.render = function() {
        if (this.sprite) {
            ctx.drawImage(resources.get(this.sprite), this.x, this.y);
        }
    }

    return Entity;
})();

/**********************************
 * UTILITES
 **********************************/

var calculateVelocity = function(degrees, speed) {
    var x, y;
    
    var radians = degrees * (Math.PI / 180);
    
    x = speed * Math.sin(radians);
    y = speed * Math.cos(radians) * -1;
    
    return {x: x, y: y};
}

var removeFromCollection = function(thing, collection) {
    for (var i = 0; i < collection.length; i++) {
        if (collection[i] === thing) {
            collection.splice(i, 1);
        }
    }
}

// Resource loader by jlongster: https://github.com/jlongster/canvas-game-bootstrap/blob/master/js/resources.js
var resources = (function() {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    // Load an image url or an array of image urls
    function load(urlOrArr) {
        if(urlOrArr instanceof Array) {
            urlOrArr.forEach(function(url) {
                _load(url);
            });
        }
        else {
            _load(urlOrArr);
        }
    }

    function _load(url) {
        if(resourceCache[url]) {
            return resourceCache[url];
        }
        else {
            var img = new Image();
            img.onload = function() {
                resourceCache[url] = img;

                if(isReady()) {
                    readyCallbacks.forEach(function(func) { func(); });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    }

    function get(url) {
        return resourceCache[url];
    }

    function isReady() {
        var ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    function onReady(func) {
        readyCallbacks.push(func);
    }

    return { 
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };
})();

var random = function(min,max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**********************************
 * POOLS
 **********************************/

var entities = [];

/**********************************
 * GAME
 **********************************/

var canvas, ctx, update, lastTIme, running = true;
 
var init = function(canvasId, startCallback, updateCallback) {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext('2d');
    
    resources.onReady(function() {
        startCallback();
        
        update = updateCallback || function () {};
        
        // Start the game
        loop();
    });
};

var loop = function() {
    if (!running) return;
    
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;    

    for (var i = 0; i < entities.length; i++) {
        entities[i].update(dt);
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (var i = 0; i < entities.length; i++) {
        entities[i].render();
    }
    
    update();
    
    lastTime = now;
    
    requestAnimFrame(loop);
};

var addEntity = function(entity) {
    entities.push(entity);
    return entity;
};

var removeEntity = function(entity) {
    removeFromCollection(entity, entities);
};

var end = function(callback) {
    running = false;
    callback();
};

/**********************************
 * EXPORT
 **********************************/

var veld = {
    init: init,
    entities: entities,
    Entity: Entity,
    addEntity: addEntity,
    removeEntity: removeEntity,
    utils: {
        random: random
    },
    resources: {
        load: resources.load
    },
    end: end
};

window.veld = veld;

})(window, document, Math);