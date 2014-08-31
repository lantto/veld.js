veld.js
=======

Tiny HTML5 game framework

# Basic usage

```html
<canvas id="game" width="512" height="512"></canvas>

<script src="veld.js"></script>
<script>

var Hero = (function() {
    function Hero(x, y, direction) {
        veld.Entity.call(this, x, y, direction);
        
        this.sprite = 'hero.png';
    }
    
    Hero.prototype = Object.create(veld.Entity.prototype);
    
    Hero.prototype.update = function() {
        veld.Entity.prototype.update.call(this);
        
        if (
            this.x > 512
            || this.x < 0
            || this.y > 512
            || this.y < 0
        ) {
            console.log('DIED', this);
            veld.removeEntity(this);
        }
    }

    return Hero;
})();

var Slime = (function() {
    function Slime(x, y, direction) {
        veld.Entity.call(this, x, y, direction);
        this.sprite = 'slime.png';
    }
    
    Slime.prototype = Object.create(veld.Entity.prototype);
    
    Slime.prototype.update = function() {
        veld.Entity.prototype.update.call(this);
        
        if (
            this.x > 512
            || this.x < 0
            || this.y > 512
            || this.y < 0
        ) {
            console.log('DIED', this);
            veld.removeEntity(this);
        }
    }

    return Slime;
})();

veld.resources.load([
    'hero.png',
    'slime.png'
]);

veld.init(
    'game', 
    function() {
        console.log(veld.addEntity(new Hero(0, 0, 135)));
        console.log(veld.addEntity(new Slime(250, 400, 15)));
        console.log(veld.addEntity(new Hero(400, 0, 200)));
        console.log(veld.addEntity(new Slime(50, 50, 90)));
    },
    function() {
        if (veld.entities.length === 0) {
            veld.end(function() {
                alert('You lost.');
            });
        }
    }
);

</script>
```
