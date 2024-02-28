import { defineTrait, make } from ".";

const walking = defineTrait<{ position: number }>().impl(
  Base =>
    class extends Base {
      walk(by: number) {
        const oldPos = this.position;
        this.position += by;
        console.log(`walking from ${oldPos} to ${this.position}`);
      }
    }
);

const noisy = defineTrait().impl(
  Base =>
    class extends Base {
      noise(sound: string) {
        console.log(sound);
      }
    }
);

const barking = defineTrait<{ noise: (sound: string) => void }>().impl(
  Base =>
    class extends Base {
      bark() {
        this.noise("BARK! BARK!");
      }
    }
);

const introduce = defineTrait<{ name: string; noise: (sound: string) => void }>().impl(
  Base =>
    class extends Base {
      introduce() {
        this.noise(this.name);
      }
    }
);

class Animal<T extends string> {
  position = 0; // comment this line and you will see an error when trying to add walking trait saying which properties are you lacking
  constructor(public name: T) {}

  eat(food: string) {
    console.log(`${this.name} is eating: ${food}`);
  }
}

// It correctly understands if required properties are provided by previous traits, not necessarily by base class
// try removing noisy trait to see it in action
const Dog = make(Animal, walking, noisy, introduce, barking);
const dog = new Dog("lass");

dog.walk(10);
dog.bark();
dog.walk(20);
dog.bark();
dog.walk(30);
dog.eat("meat");
dog.introduce();
