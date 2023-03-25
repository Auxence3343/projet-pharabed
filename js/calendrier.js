/*const notion = require("../index")
const getCalendar = notion.getCalendar

// Call the getCalendar function and log the results to the console
getCalendar().then((events) => {
  console.log(events);
}).catch((error) => {
  console.error(error);
});
*/

function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }

function getMonday(d) {
    d = new Date(d)
    var day = d.getDay()
    let diff = d.getDate() - day + (day == 0 ? -6:1)
    return new Date(d.setDate(diff))
}

const jours = ["Lun ", "Mar ", "Mer ", "Jeu ", "Ven "];
let joursemaine = getMonday(new Date())
let debutsemaine = new Date(joursemaine.getFullYear(), joursemaine.getMonth(), joursemaine.getDate(), 0, 0)

let tr = document.getElementById("jours")
let th;
for (let i = 0; i < jours.length; i++) {
    th = document.createElement("th")
    th.setAttribute("scope", "col")
    th.setAttribute("class", "text-centered mobile")
    th.appendChild(document.createTextNode(jours[i] + joursemaine.getDate() + "/" + (joursemaine.getMonth() + 1)))
    
    joursemaine.setDate(joursemaine.getDate() + 1)
    tr.appendChild(th)
}
let finsemaine = new Date(joursemaine.getFullYear(), joursemaine.getMonth(), joursemaine.getDate(), 23, 59)

let events = [
    ["Apéro", new Date(2023, 2, 20, 19, 0), new Date(2023, 2, 20, 21, 0)],
    ["Nuit des défis", new Date(2023, 2, 22, 18, 0), new Date(2023, 2, 22, 0, 0)],
    ["Nuit des défis", new Date(2023, 2, 23, 0, 0), new Date(2023, 2, 23, 6, 0)],
    ["Petit déjeuner", new Date(2023, 2, 21, 6, 30), new Date(2023, 2, 21, 10, 0)],
    ["Pot", new Date(2023, 2, 24, 22, 0), new Date(2023, 2, 24, 0, 0)],
    ["Gala", new Date(2023, 2, 31, 21, 0), new Date(2023, 2, 31, 0, 0)]
]

for(let i = 0; i < events.length; i++){
    let beginDate = events[i][1]
    let endDate = events[i][2]
    if(beginDate.getTime() >= debutsemaine.getTime() && endDate.getTime() <= finsemaine.getTime()){
      let beginHour = beginDate.getHours()
      let beginMinutes = beginDate.getMinutes()
      let idRow = beginHour * 2 + (beginMinutes >= 30)
      let endHour = endDate.getHours()
      if(endHour == 0){
        endHour = 24
      }
      let endMinutes = endDate.getMinutes()
      let len = (endHour - beginHour) * 2
      let diffMinutes = endMinutes - beginMinutes
      if(diffMinutes > 0){
          len += 1
      }
      let dayEvent = beginDate.getDate()
      let idCol = dayEvent - debutsemaine.getDate()
      let tr = getElementByXpath(`/html/body/section/table/tbody/tr[${idRow+1}]`)
      let k = tr.children.length - 1
      let td = getElementByXpath(`/html/body/section/table/tbody/tr[${idRow+1}]/td[${Math.min(idCol+1,k)}]`)
      td.setAttribute("class", "td-event")
      td.setAttribute("rowspan", `${len}`)
      let text = document.createTextNode(events[i][0])
      td.appendChild(text)

      for(let i=1; i<len; i++){
          let tr = getElementByXpath(`/html/body/section/table/tbody/tr[${idRow+1+i}]`)
          tr.removeChild(tr.children[Math.min(idCol+1,k)])
      }
    }
}


joursemaine.setDate(joursemaine.getDate() - 1)
joursemaine.setHours(23)
joursemaine.setMinutes(59)
joursemaine.setSeconds(59)

let tbody = document.getElementById("tbody")
// console.log(debutsemaine < events[0][1] < joursemaine)