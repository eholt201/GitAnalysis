const userURL = document.querySelector("#search")
const searchButton = document.querySelector(".searchButton")
const firstUsername = document.querySelector(".user__one-name")
const firstContributions = document.querySelector(".user__one-contributions")

let jsonData = "";

const generateTable = (users) => {

  let tableContents = "";
  let totalAdditions = 0;
  let totalDeletions = 0;
  let totalUserInputs = [];
  let overallTeamContribution = 0;

  let testArr = [];

  users.forEach((user) => {
    user.weeks.forEach((week) => {
      overallTeamContribution += (week.a - week.d);
    });
  });

  users.forEach((user) => {
    let totalCommits = user.total;

    user.weeks.forEach(week => {
      totalAdditions += week.a;
      totalDeletions += week.d;

      let date = moment.unix(week.w).format("DD/MM/YYYY");
      testArr.push(date);
    });

    let percentageContribution = (((totalAdditions-totalDeletions)/overallTeamContribution)*100).toFixed(1);

    tableContents += `<tr>`;
    tableContents += `<td>${user.author.login}</td>`;
    tableContents += `<td>${user.total}</td>`;
    tableContents += `<td>${totalAdditions}</td>`;
    tableContents += `<td>${totalDeletions}</td>`;
    tableContents += `<td>${percentageContribution}%</td></tr>`

    totalUserInputs.push(totalAdditions - totalDeletions);
    totalAdditions = 0;
    totalDeletions = 0;
  })
  document.getElementById("data__table").innerHTML = tableContents;


  drawPieChart(users, totalUserInputs);




  //test

  console.log(testArr);
}




const drawPieChart = ((users, pieArrayTotals) => {
  // CHART JS
  let pieArrayNames = [];
  users.forEach((user) => {
    pieArrayNames.push(user.author.login)
  });

  let data = {
    datasets: [{
      backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850", "#f7ef64", "#218b82", "#c54b6c", "#FFFAFA", "#696969", "#d291bc", "#dcfffb"],
      data: pieArrayTotals
    }],
    labels: pieArrayNames
  };

  Chart.defaults.global.defaultFontColor = 'white';
  Chart.defaults.pie.legend.position = 'right';

  let options = {
    options: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Percentage Contributed'
      },
      responsive: true,
      maintainAspectRatio: false,
    },
    tooltips: {
      callbacks: {
        label: function(tooltipItem, data) {
          var dataset = data.datasets[tooltipItem.datasetIndex];
          var meta = dataset._meta[Object.keys(dataset._meta)[0]];
          var total = meta.total;
          var currentValue = dataset.data[tooltipItem.index];
          var percentage = parseFloat((currentValue / total * 100).toFixed(1));
          return currentValue + ' (' + percentage + '%)';
        },
        title: function(tooltipItem, data) {
          return data.labels[tooltipItem[0].index];
        }
      }
    },
  }

  var ctx = document.getElementById('piechart');
  var ctx = document.getElementById('piechart').getContext('2d');
  var ctx = $('#piechart');
  var ctx = 'piechart';

  var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: options
  })

  drawBarChart(users, pieArrayNames);

});


const drawBarChart = (users, barArrayNames) => {

  let colorArray = ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850", "#f7ef64", "#218b82", "#c54b6c", "#FFFAFA", "#696969", "#d291bc", "#dcfffb"];

  const userMaker = (username, backgroundColor, data) => {
    return {
      label: username,
      backgroundColor: backgroundColor,
      data: data
    }
  }

  let dataset = [];
  let i = 0;
  let weekArray = [];

  users.forEach((user) => {
    let twelveWeeks = user.weeks.slice(0, 12);
    let twelveWeekCommits = [];
    twelveWeeks.forEach((week) => {
      twelveWeekCommits.push(week.c);
    })
    weekArray.push(twelveWeekCommits);
    dataset.push(userMaker(user.author.login, colorArray[i], weekArray[i]))
    i++;
  })


  let data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6',
      'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'
    ],
    datasets: dataset
  }

  let options = {
    title: {
      display: true,
      text: 'Percentage-based Contributions by Week'
    }
  }



  var ctx = document.getElementById('barchart');
  var ctx = document.getElementById('barchart').getContext('2d');
  var ctx = $('#barchart');
  var ctx = 'barchart';

  var myBarChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
  })

  console.log(dataset);

  calculateBehaviours(users);
}

const calculateBehaviours = (users) => {
  let behaviourArr = [];

  let behaviourContents = "";

  //for behavior table
  let tableArr = [];

  users.forEach((user) => {
    let totalCommits = user.total;
    let totalAdditions = 0;
    let totalDeletions = 0;

    user.weeks.forEach(week => {
      totalAdditions += week.a;
      totalDeletions += week.d;
    })

    let avgAdditions = (totalAdditions / totalCommits).toFixed();
    let avgDeletions = (totalDeletions / totalCommits).toFixed();

    let statement = `${user.author.login} had an average of ${avgAdditions} additions and ${avgDeletions} deletions per commit made.`
    behaviourArr.push(statement);

    behaviourContents += `<p>${statement}</p>`;

    // for behaviour table
    const tableRow = {
      user: user.author.login,
      avgAdditions: avgAdditions,
      avgDeletions: avgDeletions,
    }
    tableArr.push(tableRow);
  })
  console.log(behaviourArr);

  //document.getElementById("grid-5").innerHTML = behaviourContents;

  behaviourTable(tableArr);
}

const behaviourTable = (behaviourArr) => {
  console.log(behaviourArr)
  let tableContents = "";

  behaviourArr.forEach((row) => {
    tableContents += `<tr><td>${row.user}</td>`;
    tableContents += `<td>${row.avgAdditions}</td>`;
    tableContents += `<td>${row.avgDeletions}</td></tr>`;
  })

  document.getElementById("behaviour-table-body").innerHTML = tableContents;
}


const getJSON = async (userURL) => {
  const userInput = userURL.substring(19)
  const api_call = await fetch(`https://api.github.com/repos/${userInput}/stats/contributors`);

  const data = await api_call.json();
  return {
    data
  }
}




const showData = () => {
  getJSON(userURL.value).then((response) => {
    jsonData = response;

    generateTable(jsonData.data);
  })
}

const animate = (option, name, animation) => {
  if (option === "id") {
    var element = document.getElementById(name);

    element.classList.add('animated');
    element.classList.add(animation);
    element.classList.add('delay-1s')
    element.style.visibility = "visible";

  } else if (option === "class") {
    var elements = Array.from(document.getElementsByClassName(name));

    elements.forEach((element) => {
      element.classList.add('animated');
      element.classList.add(animation);
      //element.classList.add('delay-1s');
    })
  }
}

const changeVisibility = (className) => {
  var element = document.getElementsByClassName(className);

  element[0].style.visibility = "hidden";
  element[1].style.visibility = "hidden";
  element[2].style.visibility = "hidden";
}

searchButton.addEventListener("click", () => {
  showData();
  animate("id", "grid-2", "fadeInLeft");
  animate("id", "grid-3", "fadeInRight");
  animate("id", "grid-4", "fadeInLeft");
  animate("id", "grid-5", "fadeInRight");
  animate("id", "title-1", "fadeIn");
  animate("id", "title-2", "fadeIn");
  animate("id", "title-3", "fadeIn");
  animate("id", "grid-6", "fadeInRight")
  //changeVisibility("hide");
  animate("class", "toHide", "fadeOutLeft");

  var delayInMilliseconds = 500;
  setTimeout(function() {
      document.getElementById('title-1').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }, delayInMilliseconds);
})

const pdf = document.querySelector(".pdf")

pdf.addEventListener("click", () => {
  genPDF();
})

const genPDF = () => {
  var body = document.body;
  var doc = new jsPDF();

  doc.addHTML(body);

  doc.save("output.pdf")

}



// test repos
// 4 contributors
// https://github.com/kirstyadair/IP2-project
// https://github.com/bmitch201/IP3
// https://github.com/alexmcbride/aileronairways
// https://github.com/lab11/permamote
// 8 contributors
// https://github.com/stevemao/github-issue-templates
// 12 contributors
// https://github.com/google/eDistantObject
