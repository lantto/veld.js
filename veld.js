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
        this.direction = null;

        this.setDirection(direction || 180);
        
        this.speed = speed || 100;
        
        this.bounceAtBoundaries = true;
    }

    Entity.prototype.update = function(dt) {
        this.x += this.velocity.x * this.speed * dt;
        this.y += this.velocity.y * this.speed * dt;

        if (this.bounceAtBoundaries) {
            // TODO: Update direction property when bouncing
        
            if (this.x > gameWidth - this.width) {
                this.x = gameWidth - this.width;
                this.velocity.x = -this.velocity.x;
            }
            
            if (this.x < 0) {
                this.x = 0;
                this.velocity.x = -this.velocity.x;
            }
            
            if (this.y > gameHeight - this.height) {
                this.y = gameHeight - this.height;
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
    
    Entity.prototype.setDirection = function(direction) {
        this.velocity = calculateVelocity(direction);
        this.direction = direction;
    }
    
    Entity.prototype.collidesWith = function(otherEntity) {
        if (this.x < otherEntity.x + otherEntity.width 
            && this.x + this.width > otherEntity.x
            && this.y < otherEntity.y + otherEntity.height 
            && this.height + this.y > otherEntity.y
        ) {
            return true;
        }
        
        return false;
    }

    return Entity;
})();

/**********************************
 * UTILITES
 **********************************/

var calculateVelocity = function(degrees) {
    var x, y;
    
    var radians = degrees * (Math.PI / 180);
    
    x = Math.sin(radians);
    y = Math.cos(radians) * -1;
    
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

var random = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**********************************
 * POOLS
 **********************************/

var entities = [];

/**********************************
 * GAME
 **********************************/

var canvas, 
    ctx, 
    update, 
    lastTime, 
    running = true,
    mouse = {x: 0, y: 0, down: false, width: 1, height: 1},
    keys = {down: null},
    background,
    gameWidth,
    gameHeight;
 
var init = function(canvasId, startCallback, updateCallback, bg, width, height) {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext('2d');
    
    gameWidth = width || canvas.width;
    gameHeight = height || canvas.height;
    
    canvas.addEventListener('mousemove', function(evt) {
        var rect = canvas.getBoundingClientRect();
        mouse.x = evt.clientX - rect.left;
        mouse.y = evt.clientY - rect.top;
    }, false);
    
    canvas.addEventListener('mousedown', function(evt) {
        mouse.down = true;
    }, false);
    
    window.addEventListener('keydown', function(e) {
        keys.down = e.keyCode;
    }, false);
    
    window.addEventListener('keyup', function(e) {
        keys.down = null;
    }, false);
    
    resources.onReady(function() {
        startCallback();
        
        update = updateCallback || function() {};
        background = bg;
        
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
    
    if (background) {
        ctx.drawImage(resources.get(background), 0, 0);
    }
    
    for (var i = 0; i < entities.length; i++) {
        entities[i].render();
    }
    
    update();
    
    if (mouse.down === true) mouse.down = false;
    
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
    end: end,
    mouse: mouse,
    keys: keys
};

window.veld = veld;

})(window, document, Math);