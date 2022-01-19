const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.height = innerHeight;
//set canvas max-width to 425px
if(innerWidth>425){
  canvas.width = 425;
}
else{
  canvas.width = innerWidth;
}

//loading best score
let bestScore = localStorage.getItem('bestScore')
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('score-container').style.left = (innerWidth/2-canvas.width/2 + 4).toString() + "px"
  if(bestScore){
    document.getElementById('best-score').innerHTML = "Best: " + bestScore.toString()
  }
  else{
    localStorage.setItem('bestScore', 0)
  }
});


class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    c.beginPath();
    // c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.rect(0, canvas.height-100, canvas.width, 100);
    c.fillStyle = this.color;
    c.fill();
  }
}

//all sprite data
let enemies = [];
let projectiles = [];
let score = 0
let player = new Player(
  canvas.width / 2,
  canvas.height,
  canvas.width / 2 - 20,
  "blue"
);

function init(){
  enemies = [];
  projectiles = [];
  score = 0
  player = new Player(
    canvas.width / 2,
    canvas.height,
    canvas.width / 2 - 20,
    "blue"
  );
  score = 0
}

class Enemy {
  constructor(x, y, radius, color, velocity, acceleration) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.acceleration = acceleration;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.y += this.acceleration;
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

//angle calculation
addEventListener("click", (event) => {
  const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x - innerWidth/2 + 212.5);
  const velocity = {
    x: Math.cos(angle) * 4,
    y: Math.sin(angle) * 4,
  };
  const projectile = new Projectile(player.x, player.y, 5, "red", velocity);
  projectiles.push(projectile);
});

class Gunner {
  constructor(reloadspeed) {
    this.reloadspeed = reloadspeed;
  }
  beginshoot() {
    setInterval(shoot, 2000 / this.reloadspeed);
  }
}

let enemiesInterval
function spawnEnemies() {
  enemiesInterval = setInterval(() => {
    const radius = Math.random() * 10 + 30;
    const x = Math.random() * (canvas.width - radius * 2 - 10) + radius + 5;
    const y = -radius;
    const colorR = Math.floor(Math.random() * 255);
    const colorG = Math.floor(Math.random() * 255);
    const colorB = Math.floor(Math.random() * 255);
    const color = "rgb(" + colorR + "," + colorG + "," + colorB + ")";
    const velocityY = Math.random() * 0.5 + 0.5;
    const velocity = {
      x: Math.random() * ((canvas.width / 2 - x) / canvas.height),
      y: velocityY,
    };
    enemies.push(new Enemy(x, y, radius, color, velocity, 0.005));
  }, 1500);
}

let animation
function animate() {
  animation = requestAnimationFrame(animate);
//   c.clearRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < enemies.length; ++i) {
    for (let j = 0; j < enemies.length; ++j) {
      if (j == i) continue;
      obj1 = enemies[i];
      obj2 = enemies[j];
      const dist = Math.sqrt(
        (obj2.x - obj1.x) * (obj2.x - obj1.x) +
          (obj2.y - obj1.y) * (obj2.y - obj1.y)
      );
      if (dist - obj1.radius - obj2.radius < 1) {
        const vCollision = { x: obj2.x - obj1.x, y: obj2.y - obj1.y };
        const vCollisionNorm = {
          x: vCollision.x / dist,
          y: vCollision.y / dist,
        };
        const vRelativeVelocity = {
          x: obj1.velocity.x - obj2.velocity.x,
          y: obj1.velocity.y - obj2.velocity.y,
        };
        const speed =
          vRelativeVelocity.x * vCollisionNorm.x +
          vRelativeVelocity.y * vCollisionNorm.y;
        if (speed < 0) {
          break;
        }
        enemies[i].velocity.x -= speed * vCollisionNorm.x;
        enemies[i].velocity.y -= speed * vCollisionNorm.y;
        enemies[j].velocity.x += speed * vCollisionNorm.x;
        enemies[j].velocity.y += speed * vCollisionNorm.y;
        let impulse = (2 * speed) / (obj1.radius + obj2.radius) / 7;
        enemies[i].velocity.x -= impulse * obj2.radius * vCollisionNorm.x;
        enemies[i].velocity.y -= impulse * obj2.radius * vCollisionNorm.y;
        enemies[j].velocity.x += impulse * obj1.radius * vCollisionNorm.x;
        enemies[j].velocity.y += impulse * obj1.radius * vCollisionNorm.y;
      }
    }
  }
  enemies.forEach((enemy, index) => {
    if (
      enemy.x + enemy.radius - canvas.width < 1 ||
      enemy.x - enemy.radius < 1
    ) {
      enemy.velocity.x = -enemy.velocity.x;
    }
    projectiles.forEach((projectile, projectileIndex) => {
        const obj1 = enemy
        const obj2 = projectile
      const dist = Math.sqrt(
        (obj2.x - obj1.x) * (obj2.x - obj1.x) +
          (obj2.y - obj1.y) * (obj2.y - obj1.y)
      );
      if (dist - obj1.radius - obj2.radius < 1){
          setTimeout(() => {
            enemy.radius -= 15
            if(enemy.radius<15){
                ++score
                document.getElementById('score').innerHTML = score
                enemies.splice(index, 1)
            }
            projectiles.splice(projectileIndex, 1)
          }, 0)
      }
    });
    const obj1 = enemy
    
    if(canvas.height - obj1.y - obj1.radius - 100 < 1){
        cancelAnimationFrame(animation)
        if(score>bestScore){
          document.getElementById('best-score').innerHTML = "Best: " + score
          localStorage.setItem('bestScore', score)
          bestScore = score
        }
        document.getElementById('result').innerHTML = score
        document.getElementById('container').style.display = 'flex'
    }
    enemy.update();
  });
  player.draw();
  projectiles.forEach((projectile, index) => {
    projectile.update();
    if(projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > canvas.width ||
        projectile.y - projectile.radius > canvas.height){
        setTimeout(() => {
            projectiles.splice(index, 1)
        }, 0)
    }
  });
}
spawnEnemies();
animate();

function restart(){
  document.getElementById('score').innerHTML = 0
  document.getElementById('container').style.display = 'none'
  clearInterval(enemiesInterval)
  spawnEnemies()
  init()
  animate()
}
