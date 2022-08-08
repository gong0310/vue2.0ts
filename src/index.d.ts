// 全局型
// # let
// declare let jQuery: (selector: string) => any;

// # function
// declare function jQuery(selector: string): any;

// #class
declare class Animal {
  name: string;
  constructor(name: string);
  sayHi(): string;
}

// #enum
declare enum Directions {
  Up,
  Down,
  Left,
  Right,
}

// #namespace
declare namespace jQuery {
  function ajax(url: string, settings?: any): void;
  namespace fn {
    function extend(object: any): void;
  }
}
