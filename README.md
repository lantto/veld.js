veld.js
=======

Tiny HTML5 game framework.

# Basic usage

```html
<canvas id="game" width="512" height="512"></canvas>

<script src="veld.js"></script>
<script>

var Hero = (function() {
    function Hero(x, y, direction, speed) {
        veld.Entity.apply(this, arguments);
        
        this.sprite = 'hero.png';
        this.width = 16;
        this.height = 14;
    }
    
    Hero.prototype = Object.create(veld.Entity.prototype);

    return Hero;
})();

var Slime = (function() {
    function Slime(x, y, direction, speed) {
        veld.Entity.apply(this, arguments);
        
        this.sprite = 'slime.png';
        this.width = 24;
        this.height = 16;
    }
    
    Slime.prototype = Object.create(veld.Entity.prototype);
    
    Slime.prototype.update = function(dt) {
        if (this.collidesWith(hero)) {
            veld.end(function() {
                alert('You lost.');
            });
        }
        
        if (veld.mouse.down && this.collidesWith(veld.mouse)) {
            veld.removeEntity(this);
        }
        
        veld.Entity.prototype.update.call(this, dt);
    }

    return Slime;
})();

veld.resources.load([
    'hero.png',
    'slime.png'
]);

var hero;

veld.init(
    'game', 
    function() {
        hero = veld.addEntity(new Hero(120, 400, veld.utils.random(1, 360), 50));
        
        for (var i = 0; i < 100; i++) {
            veld.addEntity(new Slime(400, 120, veld.utils.random(1, 360), 50));
        }
    }
);

</script>
```
