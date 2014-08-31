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
    function Entity(x, y, direction, speed) {
        var velocity;
    
        this.x = x || 0;
        this.y = y || 0;
        this.width = 0;
        this.height = 0;
        
        this.direction = direction || 180;
        this.speed = speed || 100;
        
        this.bounceAtBoundaries = true;

        this._setVelocity();
    }

    Entity.prototype.update = function(dt) {
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;
        
        if (this.bounceAtBoundaries) {
            if (this.x > canvas.width - this.width) {
                this.x = canvas.width - this.width;
                this.velocity.x = -this.velocity.x;
            }
            
            if (this.x < 0) {
                this.x = 0;
                this.velocity.x = -this.velocity.x;
            }
            
            if (this.y > canvas.height - this.height) {
                this.y = canvas.height - this.height;
                this.velocity.y = -this.velocity.y;
            }
            
            if (this.y < 0) {
                this.y = 0;
                this.velocity.y = -this.velocity.y;
            }
        }
    }

    Entity.prototype.render = function() {
        if (this.sprite) {
            ctx.drawImage(resources.get(this.sprite), this.x, this.y);
        }
    }
    
    Entity.prototype.setSpeed = function(speed) {
        this.speed = speed;
        this._setVelocity();
    }
    
    Entity.prototype.setDirection = function(direction) {
        this.direction = direction;
        this._setVelocity();
    }
    
    Entity.prototype._setVelocity = function() {
        var velocity = calculateVelocity(this.direction, this.speed);
        
        this.velocity = {
            x: velocity.x,
            y: velocity.y
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

var canvas, ctx, update, lastTime, running = true;
 
var init = function(canvasId, startCallback, updateCallback) {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext('2d');
    
    resources.onReady(function() {
        startCallback();
        
        update = updateCallback || function () {};
        
        // Start the game
        lastTime = Date.now();
        
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