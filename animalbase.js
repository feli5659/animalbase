"use strict";

window.addEventListener("DOMContentLoaded", start);

// Globals

let allAnimals = [];
// let filterBy = "all";

// The prototype for all animals:
const Animal = {
  name: "",
  desc: "-unknown animal-",
  type: "",
  age: 0,
  star: false,
  winner: false,
};

const settings = {
  filter: "all",
  sortBy: "name",
  sortDir: "asc",
};

function start() {
  console.log("ready");

  loadJSON();
  registerButtons();
}

function registerButtons() {
  // Add event-listeners to filter and sort buttons
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
}

async function loadJSON() {
  const response = await fetch("animals.json");
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  allAnimals = jsonData.map(prepareObject);

  // fixed so we filter and sort from first load
  buildList();
}

function prepareObject(jsonObject) {
  const animal = Object.create(Animal);

  const texts = jsonObject.fullname.split(" ");
  animal.name = texts[0];
  animal.desc = texts[2];
  animal.type = texts[3];
  animal.age = jsonObject.age;

  return animal;
}

function selectFilter(event) {
  const filter = event.target.dataset.filter;

  console.log(`user selected ${filter}`);
  // filterList(filter);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  // find old sortby element and remove .sortby
  const oldElement = document.querySelector(`[data-sort= '${settings.sortBy}']`);
  oldElement.classList.remove("sortby");

  // indicate selected sorting direction
  event.target.classList.add("sortby");

  console.log(`User selected ${sortBy} - ${sortDir}`);
  // toggle the direction

  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }

  //  or write animal.star = !animal.star; - ! indicates the opposite
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

function filterList(filteredList) {
  // let filteredList = allAnimals;
  if (settings.filterBy === "cat") {
    // create a filtered list of only cats
    filteredList = allAnimals.filter(isCat);
  } else if (settings.filterBy === "dog") {
    filteredList = allAnimals.filter(isDog);
  }
  return filteredList;
}

function isCat(animal) {
  return animal.type === "cat";
}

function isDog(animal) {
  return animal.type === "dog";
}

function sortList(sortedList) {
  // let sortedList = allAnimals;
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  sortedList = sortedList.sort(sortByProperty);

  // this is a compare function - a function that takes two arguments and then compares them

  function sortByProperty(animalA, animalB) {
    if (animalA[settings.sortBy] < animalB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}

function buildList() {
  // create a new list by the filterlist function
  const currentList = filterList(allAnimals);
  // sort the current list
  const sortedList = sortList(currentList);

  displayList(sortedList);
}

function displayList(animals) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  animals.forEach(displayAnimal);
}

function displayAnimal(animal) {
  // create clone
  const clone = document.querySelector("template#animal").content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=name]").textContent = animal.name;
  clone.querySelector("[data-field=desc]").textContent = animal.desc;
  clone.querySelector("[data-field=type]").textContent = animal.type;
  clone.querySelector("[data-field=age]").textContent = animal.age;

  // Show star ⭐ or ☆

  if (animal.star === true) {
    clone.querySelector("[data-field=star]").textContent = "⭐";
  } else {
    clone.querySelector("[data-field=star]").textContent = "☆";
  }

  // add eventlistener for stars

  clone.querySelector("[data-field=star]").addEventListener("click", clickStar);

  function clickStar() {
    console.log(`user clicked star`);
    if (animal.star === true) {
      animal.star = false;
    } else {
      animal.star = true;
    }

    buildList();
  }

  // winners

  clone.querySelector("[data-field=winner]").dataset.winner = animal.winner;
  clone.querySelector("[data-field=winner]").addEventListener("click", clickWinner);

  function clickWinner() {
    if (animal.winner === true) {
      animal.winner = false;
    } else {
      tryToMakeAWinner(animal);
    }

    buildList();
  }

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}

function tryToMakeAWinner(selectedAnimal) {
  const winners = allAnimals.filter((animal) => animal.winner === true);
  const numberOfWinners = winners.length;
  const others = winners.filter((animal) => animal.type === selectedAnimal.type).shift();

  if (others !== undefined) {
    console.log("There can be only 1 winner of each type");
    removeOther(others);
  } else if (numberOfWinners >= 2) {
    console.log("There can only be two winners");
    removeAorB(winners[0], winners[1]);
  }

  // console.log(`There are ${numberOfWinners} winners`);
  // // console.log(`The winner of this type is ${others.name}`);
  // console.log(others);

  makeWinner(selectedAnimal);

  function removeOther(other) {
    // ask user to ignore or remove other
    document.querySelector("#remove_other").classList.remove("hide");
    document.querySelector("#remove_other .close_btn").addEventListener("click", closeDialog);
    document.querySelector("#remove_other .removeother").addEventListener("click", clickRemoveOther);
    // print name in dialog box
    document.querySelector("#remove_other [data-field=winnerOtherWinner]").textContent = others.name;

    // if ignore do nothing

    function closeDialog() {
      document.querySelector("#remove_other").classList.add("hide");
      document.querySelector("#remove_other .removeother").removeEventListener("click", clickRemoveOther);
      document.querySelector("#remove_other .close_btn").removeEventListener("click", closeDialog);
    }
    // if remove other

    function clickRemoveOther() {
      removeWinner(others);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }
  }
  function removeAorB(winnerA, winnerB) {
    // ask user to ignore or remove A or B

    document.querySelector("#remove_aorb").classList.remove("hide");
    document.querySelector("#remove_aorb .close_btn").addEventListener("click", closeDialog);
    document.querySelector("#remove_aorb .removea").addEventListener("click", clickRemoveA);
    document.querySelector("#remove_aorb .removeb").addEventListener("click", clickRemoveB);

    // print name in button
    document.querySelector("#remove_aorb [data-field=winnerA]").textContent = winnerA.name;
    document.querySelector("#remove_aorb [data-field=winnerB]").textContent = winnerB.name;
    // if ignore - do nothing
    function closeDialog() {
      document.querySelector("#remove_aorb").classList.add("hide");
      document.querySelector("#remove_aorb .removea").removeEventListener("click", clickRemoveA);
      document.querySelector("#remove_aorb .removeb").removeEventListener("click", clickRemoveB);
      document.querySelector("#remove_aorb .close_btn").removeEventListener("click", closeDialog);
    }
    // if removeA:
    function clickRemoveA() {
      removeWinner(winnerA);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }
    // else if removeB :

    function clickRemoveB() {
      removeWinner(winnerB);
      makeWinner(selectedAnimal);
      buildList();
      closeDialog();
    }
  }

  function removeWinner(winnerAnimal) {
    winnerAnimal.winner = false;
  }

  function makeWinner(animal) {
    animal.winner = true;
  }
}
