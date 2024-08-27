import chalk from 'chalk';
import readlineSync from 'readline-sync';

export const wait = (delay) => new Promise((res) => setTimeout(res,delay));

function pushLog(arr, str) {
  arr.shift();
  arr.push(str);
}

class Player {
  constructor() {
    this.hp = 100;
    this.minAt = 20;
    this.maxAt = 25;
    this.defense = 1;
  }

  attack() {
    // 플레이어의 공격
    return Math.floor(Math.random() * (this.maxAt - this.minAt)) + this.minAt;
  }

  async stageUpgrade(stage) {
    const addHp = Math.floor(((Math.random()*10) + 10)*stage);
    this.hp += addHp;

    const addAt = Math.floor((Math.random()+5)*stage);

    this.defense++;

    console.log(`스테이지 클리어!`)
    console.log(`체력 ${addHp} 공격력 ${addAt} 방어력 1% 보상을 얻었습니다.`)
    this.minAt += addAt;
    this.maxAt += addAt;
  }
}

class Monster {
  constructor() {
    this.hp = 50;
    this.minAt = 1;
    this.maxAt = 5;
    this.defense = 0;
  }

  attack() {
    // 공격력을 계산하는 함수
    return Math.floor(Math.random() * (this.maxAt - this.minAt + 1)) + this.minAt;
  }
  stageAbility(stage) {
    this.hp += (stage - 1) * 60;
    this.minAt += (stage + 1) * 3;
    this.maxAt += (stage + 1) * 3;
    this.defense = stage;
  }
}
//---------------------------------------------------------------------------------------------------------------------------- Monster 클래스 끝

//---------------------------------------------------------------------------------------------------------------------------- displayStatus 함수 선언
async function displayStatus(stage, player, monster) {
  
  const infoPlayer = `| 플레이어 정보 : 체력 - ${player.hp} | 공격력 - ${player.minAt}~${player.maxAt} | 방어력 - ${player.defense}%`;
  const infoMonster = `| 몬스터 정보 : hp - ${monster.hp} | 공격력 - ${monster.minAt}~${monster.maxAt} | 방어력 - ${monster.defense}%`;
  console.log(
    chalk.cyanBright((' ').repeat(36) + `| Stage: ${stage}`, '\n') +
    chalk.blueBright(
      (' ').repeat((90 - infoPlayer.length) / 2) + infoPlayer + '\n'
    ) +
    chalk.redBright(
      (' ').repeat((90 - infoMonster.length) / 2) + infoMonster + '\n'
    ),
  );
}

const battle = async (stage, player, monster, reg) => {

  let logs = new Array(30).fill("");
  
  let prey = 1;
  while (player.hp > 0 && monster.hp > 0 && reg.cur === 1) {
    console.clear();

    await displayStatus(stage, player, monster);
    console.log(`${stage} 보스가 등장했습니다.`);

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.white(
        `| 1. 일반공격 | 2. 한발에 두놈(50%) | 3.헤드샷(잔여:${prey}회 10%) | 4. 도망가기 (운:10%) | 5. 종료하기 | \n\n`,
      ),
    );

    async function battleInput() {

      const choice = readlineSync.question(' ► 선택? ');

      switch (choice) {
        case '1':
          const attP = player.attack() - (monster.defense*stage);
          const attM = monster.attack() - (player.defense*stage);
          monster.hp -= Math.floor(attP);
          pushLog(logs, chalk.green(` 몬스터에게 ${Math.floor(attP)} 만큼 피해를 입혔습니다.`));
          player.hp -= Math.floor(attM);
          pushLog(logs, chalk.red(`몬스터로부터 ${Math.floor(attM)} 만큼 피해를 받았습니다.`));
          break;
        case '2':
          const ddRand = Math.floor(Math.random() * 101);
          if (ddRand <= 50) {
            pushLog(logs, chalk.green(`한발에 두놈!`));
            let attP = player.attack() - (monster.defense*stage);
            monster.hp -= Math.floor(attP);
            pushLog(logs, chalk.green(` 몬스터에게 ${Math.floor(attP)} 만큼 피해를 입혔습니다.`));
            attP = player.attack() - (monster.defense*stage);
            monster.hp -= Math.floor(attP);
            pushLog(logs, chalk.green(` 몬스터에게 ${Math.floor(attP)} 만큼 피해를 입혔습니다.`));
          } else {
            const attM = monster.attack() - (player.defense*stage);
            player.hp -= Math.floor(attM);
            pushLog(logs, chalk.red(`실패 ㅠ`));
            pushLog(logs, chalk.red(` 몬스터로부터 ${Math.floor(attM)} 만큼 피해를 받았습니다.`));
          }
          break;
        case '3':
          const rand = Math.floor(Math.random() * 101);
          if (prey === 1 && rand <= 10) {
            monster.hp = 0;
            pushLog(logs, chalk.green(` 헤드샷 !!!.`));
          }
          else if (prey !== 1) {
            pushLog(logs, chalk.red(`기회가 없습니다.`));
          }
          else {
            pushLog(logs, chalk.red(`헤드샷에 실패하였습니다.`));
            prey--;
          }
          break;
          case '4':
            const run = Math.floor(Math.random() * 11);
            if(run <= 1) {
              monster.hp = 0;
              pushLog(logs, chalk.green(`쫒아오던 몬스터가 돌에 걸려 넘어져 죽었습니다. 스테이지를 클러이 하셨습니다.`));
            }
            else if (2<= run && run <= 5) {
              pushLog(logs, chalk.green(` 도망 성공 !!!`));
              --stage;
              await wait(1000);
              return;
            }
            else {
            const attM = monster.attack() - (player.defense*stage);
            player.hp -= Math.floor(attM);
            pushLog(logs, chalk.red(` 도망 실패 !`));
            pushLog(logs, chalk.red(` 몬스터로부터 ${Math.floor(attM)} 만큼 피해를 받았습니다.`));
            }
            break;
          case '5':
            console.log(chalk.red(`게임을 포기하셨습니다`));
            reg.cur = 0;
            break;
        default:
          console.log(chalk.red(`올바른 선택을 하세요.`));
          battleInput();
          break;
      }
    }
    await battleInput();
  }
  if (player.hp < 0) {
    console.log(chalk.red("플레이어가 죽었습니다. 메뉴로 돌아갑니다."),);
    await wait(3000);

    return;
  } else if(monster.hp < 0) {
    console.clear();
    console.log(chalk.blue("몬스터를 물리쳤습니다! 잠시 후 다음 스테이지로 이동합니다."),);
  } else {
    await wait(3000);
  }

};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;
  let stageNum = 10;
  let reg = {
    cur : 1
  };

  while (stage <= stageNum && reg.cur === 1) {
    const monster = new Monster(stage);
    monster.stageAbility(stage);
    await battle(stage, player, monster,reg);

    if (player.hp > 0 && reg.cur===1) {
      stage++;
      await player.stageUpgrade(stage);
      await wait(1500);

    } else {
      return;
    }

  }

  console.log("클리어 하셨습니다 !!");
  await wait(2000);
  return;
}