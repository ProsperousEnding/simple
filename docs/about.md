# About Me

<div class="profile-container">
  <img src="/logo.svg" alt="My Profile">
  <div class="profile-info">
    <h2>👋 Hey there, I'm ProsperousEnding</h2>
    <p>一个热爱代码、热爱卡牌、热爱游戏王的极客Boy</p>
  </div>
</div>

## 💻 Code Enthusiast
<div class="section-container">
  <div class="content">
    <p>作为一名开发者，我热衷于探索新技术，解决各种问题。每一行代码都是一次创造，每个项目都是一次冒险。我相信技术不仅能改变生活，更能创造价值。</p>
    <p>就像调试代码一样，我享受着在编程世界中探索和学习的过程。</p>
  </div>
  <img src="/compute.jpg" alt="Coding Setup">
</div>

## ⚔️ Yu-Gi-Oh! Duelist
<div class="section-container reverse">
  <img src="/codeTalker.png" alt="Code Talker">
  <div class="content">
    <p>作为一名决斗者，我最爱的卡组是「码语者」(Code Talker)。这副卡组促进了我编程的热爱与不断学习</p>
    <p>很喜欢的一段话：💭每一次的连接召唤都像是在写一段代码，连接标记即是接口，链接标记在数据风暴中穿梭，促成了代码的运行。</p>
  </div>
</div>

## 🎮 Gaming Aficionado
<div class="section-container">
  <div class="content">
    <p>游戏我喜欢玩绝区零，作为一个绝绝子，我最喜欢的角色还是安比，果然对我来说汉堡和代码同等重要。</p>
  </div>
  <img src="/anby-bb.jpg" alt="Anby eating bread">
</div>

## 🌟 What Drives Me
<div class="quote">
  <blockquote>
    代码如诗，决斗如画，游戏如梦。在这三个世界的交织中，我找到了属于自己的独特节奏。see you in next realm ✨
  </blockquote>
</div>

<style>
.profile-container {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin: 2rem 0;
}

.profile-container img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.8s ease;
}

.profile-container img:hover {
  transform: rotate(360deg);
}

.section-container {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin: 2rem 0;
}

.section-container.reverse {
  flex-direction: row-reverse;
}

.section-container .content {
  flex: 1;
}

.section-container img {
  width: 300px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.section-container img:hover {
  transform: scale(1.05);
}

.quote {
  padding: 2rem;
  background: linear-gradient(145deg, #f3f4f6, #ffffff);
  border-radius: 12px;
  margin: 2rem 0;
}

blockquote {
  margin: 0;
  font-style: italic;
  color: #4b5563;
  text-align: center;
}

@media (max-width: 768px) {
  .section-container, .section-container.reverse {
    flex-direction: column;
  }
  
  .section-container img {
    width: 100%;
  }
  
  .profile-container {
    flex-direction: column;
    text-align: center;
  }
}

</style>