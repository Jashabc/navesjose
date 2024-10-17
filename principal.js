var fondoJuego;
var nave;
var cursores;
var balas;
var balasEnemigos;
var tiempoBala = 0;
var tiempoDispároEnemigo = 0;
var botonDisparo;
var enemigos;
var score = 0;
var scoreText;
var vidas = 3;
var vidasText;
var nivel = 1;
var nivelText;
var musicaFondo;
var sonidoColision;
var sonidoDisparo;
var sonidoExplosion;
var portada;
var botonJugar;
var mensajeFinal;

var juego = new Phaser.Game(370, 550, Phaser.CANVAS, 'escena');

var estadoPortada = {
    preload: function() {
        juego.load.image('portada', 'img/bg.jpeg');
        juego.load.image('botonJugar', 'img/btn.png');
    },
    create: function() {
        portada = juego.add.sprite(0, 0, 'portada');
        botonJugar = juego.add.button(juego.world.centerX, 400, 'botonJugar', this.iniciarJuego, this);
        botonJugar.anchor.setTo(0.5);
        
        var nombre = juego.add.text(juego.world.centerX, 500, "Neira Huaman Jose Antonio U21215544", { font: "20px Arial", fill: "#ffffff" });
        nombre.anchor.setTo(0.5);
    },
    iniciarJuego: function() {
        juego.state.start('principal');
    }
};

var estadoPrincipal = {
    preload: function(){
        juego.load.image('fondo', 'img/espacioo.jpg');
        juego.load.image('personaje', 'img/fie2.gif');
        juego.load.image('laser', 'img/laser.png');
        juego.load.image('laserEnemigo', 'img/laser.png');
        juego.load.image('enemigo', 'img/pajarito.png');
        juego.load.image('enemigoNivel2', 'img/pajaro2.png');
        juego.load.audio('musicaFondo', 'audio/sonido_fondo.mp3');
        juego.load.audio('sonidoColision', 'audio/colision.mp3');
        juego.load.audio('sonidoDisparo', 'audio/disparo.mp3');
        juego.load.audio('sonidoExplosion', 'audio/explosion.mp3');
    },

    create: function(){
        juego.physics.startSystem(Phaser.Physics.ARCADE);

        fondoJuego = juego.add.tileSprite(0,0,370,550,'fondo');
        
        this.crearNave();
        this.crearEnemigos();
        this.crearBalasEnemigos();

        scoreText = juego.add.text(16, 16, 'Score: ' + score, { fontSize: '18px', fill: '#fff' });
        vidasText = juego.add.text(juego.world.width - 100, 16, 'Vidas: ' + vidas, { fontSize: '18px', fill: '#fff' });
        nivelText = juego.add.text(juego.world.centerX, 16, 'Nivel: ' + nivel, { fontSize: '18px', fill: '#fff' });
        nivelText.anchor.setTo(0.5, 0);

        musicaFondo = juego.add.audio('musicaFondo');
        sonidoColision = juego.add.audio('sonidoColision');
        sonidoDisparo = juego.add.audio('sonidoDisparo');
        sonidoExplosion = juego.add.audio('sonidoExplosion');

        musicaFondo.loop = true;
        musicaFondo.play();
    },


    crearNave: function() {
        nave = juego.add.sprite(juego.width/2, 500, 'personaje');
        nave.anchor.setTo(0.5);
        juego.physics.arcade.enable(nave);
        nave.body.collideWorldBounds = true;

        cursores = juego.input.keyboard.createCursorKeys();
        botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        balas = juego.add.group();
        balas.enableBody = true;
        balas.physicsBodyType = Phaser.Physics.ARCADE;
        balas.createMultiple(20,'laser');
        balas.setAll('anchor.x', 0.5);
        balas.setAll('anchor.y', 1);
        balas.setAll('outOfBoundsKill', true);
        balas.setAll('checkWorldBounds', true);
    },

    crearEnemigos: function() {
        if (enemigos) {
            enemigos.removeAll(true);
        }
        enemigos = juego.add.group();
        enemigos.enableBody = true;
        enemigos.physicsBodyType = Phaser.Physics.ARCADE;

        for (var y = 0; y < 4; y++) {
            for (var x = 0; x < 8; x++) {
                var enemigo = enemigos.create(x * 40, y * 40, nivel === 1 ? 'enemigo' : 'enemigoNivel2');
                enemigo.anchor.setTo(0.5);
            }
        }

        enemigos.x = 50;
        enemigos.y = 50;

        var velocidad = nivel === 1 ? 2000 : 1000;
        var animacion = juego.add.tween(enemigos).to({x: 100}, velocidad, Phaser.Easing.Linear.None, true, 0, -1, true);
    },

    crearBalasEnemigos: function() {
        balasEnemigos = juego.add.group();
        balasEnemigos.enableBody = true;
        balasEnemigos.physicsBodyType = Phaser.Physics.ARCADE;
        balasEnemigos.createMultiple(30, 'laserEnemigo');
        balasEnemigos.setAll('anchor.x', 0.5);
        balasEnemigos.setAll('anchor.y', 1);
        balasEnemigos.setAll('outOfBoundsKill', true);
        balasEnemigos.setAll('checkWorldBounds', true);
    },

    disparoEnemigo: function() {
        var bala = balasEnemigos.getFirstExists(false);
        var enemigosVivos = [];
        enemigos.forEachAlive(function(enemigo){
            enemigosVivos.push(enemigo);
        });
        if (bala && enemigosVivos.length > 0) {
            var enemigoAleatorio = enemigosVivos[Math.floor(Math.random() * enemigosVivos.length)];
            bala.reset(enemigoAleatorio.x, enemigoAleatorio.y);
            juego.physics.arcade.moveToObject(bala, nave, 120);
            tiempoDispároEnemigo = juego.time.now + 2000;
        }
    },

    update: function(){
        if (cursores.right.isDown && nave.x < juego.width - 20){
            nave.x += 3;
        } else if (cursores.left.isDown && nave.x > 20){
            nave.x -= 3;
        }

        if (botonDisparo.isDown){
            this.disparar();
        }

        if (juego.time.now > tiempoDispároEnemigo) {
            this.disparoEnemigo();
        }

        juego.physics.arcade.overlap(balas, enemigos, this.colision, null, this);
        juego.physics.arcade.overlap(balasEnemigos, nave, this.perderVida, null, this);
        juego.physics.arcade.overlap(nave, enemigos, this.perderVida, null, this);

        if (enemigos.countLiving() === 0) {
            this.siguienteNivel();
        }
    },

    disparar: function() {
        if (juego.time.now > tiempoBala) {
            var bala = balas.getFirstExists(false);
            if (bala) {
                bala.reset(nave.x, nave.y);
                bala.body.velocity.y = -300;
                tiempoBala = juego.time.now + 100;
                sonidoDisparo.play();
            }
        }
    },

    colision: function(bala, enemigo) {
        bala.kill();
        enemigo.kill();
        sonidoExplosion.play();

        score += 10;
        scoreText.text = 'Score: ' + score;

        if (score % 30 === 0) {
            this.siguienteNivel();
        }
    },

    perderVida: function(nave, objetoQueGolpea) {
        if (nave.invulnerable) return;

        sonidoColision.play();
        vidas--;
        vidasText.text = 'Vidas: ' + vidas;


        nave.invulnerable = true;
        nave.alpha = 0.5;

        juego.time.events.add(1000, function() {
            nave.invulnerable = false;
            nave.alpha = 1;
        }, this);

        if (vidas <= 0) {
            this.finJuego('VUELVE A INTENTARLO');
        }
    },

    siguienteNivel: function() {
        nivel++;
        if (nivel > 3) {
            this.finJuego('GANASTE');
        } else {
            nivelText.text = 'Nivel: ' + nivel;
            this.crearEnemigos();
        }
    },

    finJuego: function(mensaje) {
        nave.kill();
        enemigos.removeAll(true);
        balasEnemigos.removeAll(true);
        mensajeFinal = juego.add.text(juego.world.centerX, juego.world.centerY, mensaje, { fontSize: '32px', fill: '#fff' });
        mensajeFinal.anchor.setTo(0.5);
        juego.time.events.add(Phaser.Timer.SECOND * 3, function() {
            this.volverAInicio();
        }, this);
    },

    volverAInicio: function() {
        score = 0;
        nivel = 1;
        vidas = 3;
        juego.state.start('portada');
    }
};

juego.state.add('portada', estadoPortada);
juego.state.add('principal', estadoPrincipal);
juego.state.start('portada');