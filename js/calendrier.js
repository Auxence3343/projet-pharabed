function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }

function getMonday(d) {
    d = new Date(d)
    var day = d.getDay()
    diff = d.getDate() - day + (day == 0 ? -6:1)
    return new Date(d.setDate(diff))
}

const jours = ["Lundi ", "Mardi ", "Mercredi ", "Jeudi ", "Vendredi "];
joursemaine = getMonday(new Date())
debutsemaine = new Date(joursemaine.getFullYear(), joursemaine.getMonth(), joursemaine.getDate(), 0, 0)

tr = document.getElementById("jours")
let th;
for (let i = 0; i < jours.length; i++) {
    th = document.createElement("th")
    th.setAttribute("scope", "col")
    th.appendChild(document.createTextNode(jours[i] + joursemaine.getDate() + "/" + (joursemaine.getMonth() + 1)))
    joursemaine.setDate(joursemaine.getDate() + 1)
    tr.appendChild(th)
}

events = [
    ["Apéro", new Date(2023, 3, 22, 8, 0), new Date(2023, 3, 22, 9, 0)],
    ["Goûter", new Date(2023, 3, 21, 18, 0), new Date(2023, 3, 21, 21, 0)],
]

for(let i = 0; i < events.length; i++){
    let beginDate = events[i][1]
    let beginHour = beginDate.getHours()
    let beginMinutes = beginDate.getMinutes()
    let idRow = beginHour * 2 + (beginMinutes >= 30)
    let endDate = events[i][2]
    let endHour = endDate.getHours()
    let endMinutes = endDate.getMinutes()
    let len = (endHour - beginHour) * 2
    let diffMinutes = endMinutes - beginMinutes
    if(diffMinutes > 0){
        len += 1
    }
    let dayEvent = beginDate.getDate()
    let idCol = dayEvent - debutsemaine.getDate()

    td = getElementByXpath(`/html/body/table/tbody/tr[${idRow+1}]/td[${idCol}]`)
    td.setAttribute("class", "td-event")
    td.setAttribute("rowspan", `${len}`)
    let text = document.createTextNode(events[i][0])
    td.appendChild(text)
}


joursemaine.setDate(joursemaine.getDate() - 1)
joursemaine.setHours(23)
joursemaine.setMinutes(59)
joursemaine.setSeconds(59)

tbody = document.getElementById("tbody")
// console.log(debutsemaine < events[0][1] < joursemaine)