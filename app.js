const userURL = document.querySelector("#search")
const searchButton = document.querySelector(".searchButton")
const timeframeDropdown = document.querySelector("#timeframe");

let jsonData = "";

const generateTable = (users, dateTestArr) => {
  let tableContents = "";
  let totalAdditions = 0;
  let totalDeletions = 0;
  let totalUserInputs = [];
  let overallTeamContribution = 0;

  // loop through JSON object to calulate total team input
  users.forEach((user) => {
    user.weeks.forEach((week) => {
      overallTeamContribution += (week.a - week.d);
    });
  });

  // calculating total individual additions and deletions of each user
  users.forEach((user) => {
    let totalCommits = user.total;

    user.weeks.forEach(week => {
      totalAdditions += week.a;
      totalDeletions += week.d;
    });


    //calculating percentage contributed for each user
    let percentageContribution = (((totalAdditions - totalDeletions) / overallTeamContribution) * 100).toFixed(1);

    //formatting and populating table to be passed to grid element
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


  drawPieChart(users, totalUserInputs, dateTestArr);
}




const drawPieChart = ((users, pieArrayTotals, dateTestArr) => {

  let pieArrayNames = [];
  users.forEach((user) => {
    pieArrayNames.push(user.author.login)
  });


  // formatting data to be accepted by Chart.js
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
          //making percentages contributed viewable via tooltip
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

  // passing finalised calculated data to Chart.js
  var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: options
  })

  drawBarChart(users, pieArrayNames, dateTestArr);

});


const drawBarChart = (users, barArrayNames, dateTestArr) => {

  // retrieving start date and timeframe from user
  let date = document.getElementById('start-date').value;
  let timeFrame = document.getElementById('timeframe').value;
  let dateRange = dateTestArr.splice(date, timeFrame);

  let colorArray = ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850", "#f7ef64", "#218b82", "#c54b6c", "#FFFAFA", "#696969", "#d291bc", "#dcfffb"];

  // factory function used for formatting data to be passed to bar chart
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

  // Retrieving valid data based on start date and timeframe then passing to the factory function to be formatted
  users.forEach((user) => {
    let timePeriod = user.weeks.slice(0, timeFrame);
    let timePeriodCommits = [];
    timePeriod.forEach((week) => {
      timePeriodCommits.push(week.c);
    })
    weekArray.push(timePeriodCommits);
    dataset.push(userMaker(user.author.login, colorArray[i], weekArray[i]))
    i++;
  })


  let data = {
    labels: dateRange,
    datasets: dataset
  }

  let options = {
    title: {
      display: true,
      text: 'Activity-based Contributions by Week'
    }
  }



  var ctx = document.getElementById('barchart');
  var ctx = document.getElementById('barchart').getContext('2d');
  var ctx = $('#barchart');
  var ctx = 'barchart';

  // Passing data to Chart.js
  var myBarChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
  })

  calculateBehaviours(users);
}

const calculateBehaviours = (users) => {
  let behaviourArr = [];

  let behaviourContents = "";

  let tableArr = [];

  // Calculating average behaviours per commit to be placed in behaviour table
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

    // for behaviour table
    const tableRow = {
      user: user.author.login,
      avgAdditions: avgAdditions,
      avgDeletions: avgDeletions,
    }
    tableArr.push(tableRow);
  })

  behaviourTable(tableArr);
}

const behaviourTable = (behaviourArr) => {

  let tableContents = "";

  behaviourArr.forEach((row) => {
    tableContents += `<tr><td>${row.user}</td>`;
    tableContents += `<td>${row.avgAdditions}</td>`;
    tableContents += `<td>${row.avgDeletions}</td></tr>`;
  })

  document.getElementById("behaviour-table-body").innerHTML = tableContents;
}

// Retrieves data from Github API
const getJSON = async (userURL) => {
  const userInput = userURL.substring(19)
  const api_call = await fetch(`https://api.github.com/repos/${userInput}/stats/contributors`);

  const data = await api_call.json();
  return {
    data
  }
}



//  Confirms link entered has returned a valid JSON Object with data
const showData = () => {
  getJSON(userURL.value).then((response) => {
    jsonData = response;
    if (response.data.message === "Not Found") {
      alert("Invalid Link: Enter link in the format 'https://github.com/AdminUser/RepositoryName'")
    } else {
      animate("class", "toHide", "fadeOutLeft");
      animate("id", "date-container", "fadeInRight")
      getDates(jsonData.data);
    }
  })
}

// Styling to animate components
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

// Removes elements such as link entry box once link has been entered
const changeVisibility = (className) => {
  var element = document.getElementsByClassName(className);

  element[0].style.visibility = "hidden";
  element[1].style.visibility = "hidden";
  element[2].style.visibility = "hidden";
}

// Retrieves start date and timeframe from user
const getTimeFrame = () => {
  let date = document.getElementById('start-date').value;
  let timeframe = document.getElementById('timeframe').value;

  animate("id", "grid-2", "fadeInLeft");
  animate("id", "grid-3", "fadeInRight");
  animate("id", "grid-4", "fadeInLeft");
  animate("id", "grid-5", "fadeInRight");
  animate("id", "title-1", "fadeIn");
  animate("id", "title-2", "fadeIn");
  animate("id", "title-3", "fadeIn");
  animate("id", "grid-6", "fadeInRight")

  // Delays in order for Charts to be calculated before animating into view
  var delayInMilliseconds = 500;
  setTimeout(function() {
    document.getElementById('title-1').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }, delayInMilliseconds);
}

// Loops through JSON Object to retrieve dates to offer to the user, using moment.js library
// to convert UNIX timestamps to "DD/MM/YYYY" format
const getDates = (users) => {

  let dateTestArr = [];
  let totalWeeks = 0;

  let j = 0;
  users.forEach((user) => {
    totalWeeks = user.weeks.length;

    user.weeks.forEach(week => {

      if (j < totalWeeks) {
        let date = moment.unix(week.w).format("DD/MM/YYYY");
        dateTestArr.push(date);

        j++;
      }
    });
  });

  var select = document.getElementById("start-date");
  for (index in dateTestArr) {
    select.options[select.options.length] = new Option(dateTestArr[index], index);
  }

  // Listens to date and tiemframe being selected so analysis can then be performed
  timeframeDropdown.addEventListener("change", () => {
    getTimeFrame();

    animate("class", "date-hide", "fadeOutLeft");
    animate("id", "print-container", "fadeInRight");
    generateTable(jsonData.data, dateTestArr);
  })
}

searchButton.addEventListener("click", () => {
  showData();
})


// some test repos
// 4 contributors
// https://github.com/kirstyadair/IP2-project
// https://github.com/bmitch201/IP3
// https://github.com/alexmcbride/aileronairways
// https://github.com/lab11/permamote
// 8 contributors
// https://github.com/stevemao/github-issue-templates
// 12 contributors
// https://github.com/google/eDistantObject
