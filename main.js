function ifUndefinedDefaultTo(value, defaultValue) {
    if (value === undefined) return defaultValue
    else return value
}

function loadDefaultValues() {
    const simulationParameters = getSavedValue('simulationParameters')

    document.getElementById('initialNetWorth').value = ifUndefinedDefaultTo(simulationParameters.initialNetWorth, 10000)
    document.getElementById('monthlyContribution').value = ifUndefinedDefaultTo(simulationParameters.monthlyContribution, 500)
    document.getElementById('stopContributionYears').value = ifUndefinedDefaultTo(simulationParameters.stopContributionYears, null)
    document.getElementById('stopContributionMonths').value = ifUndefinedDefaultTo(simulationParameters.stopContributionMonths, null)
    document.getElementById('lifestyleMonthlyCost').value = ifUndefinedDefaultTo(simulationParameters.lifestyleMonthlyCost, 3000)
    document.getElementById('contributionIncrease').value = ifUndefinedDefaultTo(simulationParameters.contributionIncrease, 8)
    document.getElementById('interestRate').value = ifUndefinedDefaultTo(simulationParameters.interestRate, 12)
    document.getElementById('incomeTax').value = ifUndefinedDefaultTo(simulationParameters.incomeTax, 0)
    document.getElementById('inflationRate').value = ifUndefinedDefaultTo(simulationParameters.inflationRate, 6)
    document.getElementById('initialDate').value = formatDateToHTMLYearMonth(new Date())
    document.getElementById('birthMonth').value = ifUndefinedDefaultTo(simulationParameters.birthMonth, formatDateToHTMLYearMonth(new Date(1990, 1 - 1, 1)))
    document.getElementById('yearsAmount').value = ifUndefinedDefaultTo(simulationParameters.yearsAmount, 50)
}

function saveCurrentSimulationParameters() {
    const simulationParameters = {
        initialNetWorth: document.getElementById('initialNetWorth').value,
        monthlyContribution: document.getElementById('monthlyContribution').value,
        stopContributionYears: document.getElementById('stopContributionYears').value,
        stopContributionMonths: document.getElementById('stopContributionMonths').value,
        lifestyleMonthlyCost: document.getElementById('lifestyleMonthlyCost').value,
        contributionIncrease: document.getElementById('contributionIncrease').value,
        interestRate: document.getElementById('interestRate').value,
        incomeTax: document.getElementById('incomeTax').value,
        inflationRate: document.getElementById('inflationRate').value,
        //initialDate: document.getElementById('initialDate').value,
        birthMonth: document.getElementById('birthMonth').value,
        yearsAmount: document.getElementById('yearsAmount').value,
    }
    saveValue('simulationParameters', simulationParameters)
}


document.getElementById("form").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault()
        simulate()
    }
})

function areSimulationParametersValid() {
    let allValid = true

    const forms = document.querySelectorAll('.needs-validation')
    Array.from(forms).forEach(form => {
        const isFormValid = form.checkValidity()
        form.classList.add('was-validated')
        if (!isFormValid) allValid = false
    })

    return allValid
}

function simulate() {
    if (areSimulationParametersValid()) {
        saveCurrentSimulationParameters()
        setBusy(true)
        setTimeout(() => {
            const tableData = generateSimulationTableData()
            generateHtmlTable(tableData)
            generateAnalysisTexts(tableData)
            generateChart(tableData)
            setBusy(false)
        }, 20)
    }
    return false // prevent page reload
}

function generateAnalysisTexts(tableData) {
    const analysisDiv = document.getElementById("analysis")
    analysisDiv.innerHTML = ''

    const lifestyleMonthlyCost = Number(document.getElementById('lifestyleMonthlyCost').value)
    const entry = tableData.find(element => element.netInvestmentIncomeMinusInflationWithoutInflationEffect >= lifestyleMonthlyCost)

    if (entry) {
        const years = Math.floor(entry.monthIndex / 12)
        const months = entry.monthIndex % 12
        if (years === 0 && months === 0) {
            const lifestyleMonthlyCostMessage = `Considering your lifestyle monthly cost, <strong>you have already reached your forever financial independence</strong>.<br>\
            Congratulations!`
            createAndAppendElement('div', { role: 'alert', class: "alert alert-success" }, lifestyleMonthlyCostMessage, analysisDiv)
        } else {
            const lifestyleMonthlyCostMessage = `Considering your lifestyle monthly cost, you will reach your forever financial independence\
            in <strong>${formatLongMonthYear(entry.referenceMonthYear)}</strong>.<br>\
            That is <strong>${years ? (years + ' year' + (years > 1 ? 's' : '')) : ''}${(years && months) ? ' and ' : ''}${months ? (months + ' month' + (months > 1 ? 's' : '')) : ''}</strong> from the initial date.<br>\
            You will be <strong>${entry.age} years old</strong> and will have a net worth of <strong>${formatCurrency(entry.netWorth)}</strong>.`
            createAndAppendElement('div', { role: 'alert', class: "alert alert-info" }, lifestyleMonthlyCostMessage, analysisDiv)
        }
    } else {
        const lifestyleMonthlyCostMessage = `Considering your lifestyle monthly cost, <strong>you will never reach your forever financial independence</strong> during this simulation.<br>\
            Consider improving your financial variables.`
        createAndAppendElement('div', { role: 'alert', class: "alert alert-danger" }, lifestyleMonthlyCostMessage, analysisDiv)
    }

}

function formatShortMonthIndex(monthIndex) {
    return Math.floor(monthIndex / 12) + "y " + monthIndex % 12 + "m"
}

function generateHtmlTable(tableData) {
    const tableBody = document.getElementById("tableBody")
    tableBody.innerHTML = ''

    for (const tableRow of tableData) {
        const tr = createAndAppendElement('tr', null, null, tableBody)
        // createAndAppendElement('th', { scope: 'row', class: 'text-end' }, tableRow.monthIndex, tr)
        createAndAppendElement('th', null, formatShortMonthIndex(tableRow.monthIndex), tr)
        createAndAppendElement('td', null, formatLongMonthYear(tableRow.referenceMonthYear), tr)
        createAndAppendElement('td', { class: 'text-end' }, tableRow.age, tr)
        createAndAppendElement('td', { class: 'text-end' }, formatCurrency(tableRow.netWorth), tr)
        createAndAppendElement('td', { class: 'text-end' }, formatCurrency(tableRow.netWorthWithoutInflationEffect), tr)
        createAndAppendElement('td', { class: 'text-end' }, formatCurrency(tableRow.grossInvestmentIncome), tr)
        createAndAppendElement('td', { class: 'text-end' }, formatCurrency(tableRow.investmentIncomeTax), tr)
        createAndAppendElement('td', { class: 'text-end' }, formatCurrency(tableRow.netInvestmentIncome), tr)
        createAndAppendElement('td', { class: 'text-end' }, formatCurrency(tableRow.contribution), tr)
        createAndAppendElement('td', { class: 'text-end' }, formatCurrency(tableRow.inflation), tr)
        createAndAppendElement('td', { class: 'text-end' }, formatCurrency(tableRow.netInvestmentIncomeMinusInflation), tr)
        createAndAppendElement('td', { class: 'text-end' }, formatCurrency(tableRow.netInvestmentIncomeMinusInflationWithoutInflationEffect), tr)
    }
}

function formatCurrency(amount, currencyCode = CURRENCY_CODE, locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        notation: 'compact',
        minimumSignificantDigits: 3,
        maximumSignificantDigits: 3,
        //maximumFractionDigits: 2,
    }).format(amount)
}

function createAndAppendElement(tagName, attributes, content, parentElement) {
    const element = document.createElement(tagName)
    if (attributes) {
        for (const attr in attributes) {
            element.setAttribute(attr, attributes[attr])
        }
    }
    if (content !== undefined && content !== null) {
        element.innerHTML = content
    }
    if (parentElement) {
        parentElement.appendChild(element)
    }
    return element
}

const loadingModalElement = document.getElementById("loadingModal")
let loadingModal = new bootstrap.Modal(loadingModalElement)

function setBusy(value) {
    if (value) {
        loadingModal.show()
    } else {
        loadingModal.hide()
    }
}

function convertHTMLYearMonthToLocalDate(yearMonthString) {
    const date = new Date(yearMonthString)
    return new Date(date.getUTCFullYear(), date.getUTCMonth())
}


function generateSimulationTableData() {

    const month = convertHTMLYearMonthToLocalDate(document.getElementById('initialDate').value)

    const table = []

    const netWorth = Number(document.getElementById('initialNetWorth').value)
    const interestRate = Number(document.getElementById('interestRate').value)
    const incomeTaxRate = Number(document.getElementById('incomeTax').value)
    const inflationRate = Number(document.getElementById('inflationRate').value)
    const birthMonth = convertHTMLYearMonthToLocalDate(document.getElementById('birthMonth').value)
    const contribution = Number(document.getElementById('monthlyContribution').value)
    const contributionIncreaseRate = Number(document.getElementById('contributionIncrease').value)
    const yearsAmount = Number(document.getElementById('yearsAmount').value)
    const stopContributionYears = document.getElementById('stopContributionYears').value
    const stopContributionMonths = document.getElementById('stopContributionMonths').value
    const stopContributionInMonths = stopContributionYears === '' && stopContributionMonths === '' ? undefined : Number(stopContributionYears) * 12 + Number(stopContributionMonths)
    const lifestyleMonthlyCost = Number(document.getElementById('lifestyleMonthlyCost').value)

    const referenceMonthYear = addMonths(month, 0)
    const grossInvestmentIncome = calculatePercentagePerMonthWithoutValue(netWorth, interestRate)
    const investmentIncomeTax = calculatePercentagePerMonthWithoutValue(netWorth, interestRate * incomeTaxRate / 100)//calculatePercentage(grossInvestmentIncome, incomeTaxRate)
    const netInvestmentIncome = calculatePercentagePerMonthWithoutValue(netWorth, interestRate - interestRate * incomeTaxRate / 100)//grossInvestmentIncome - investmentIncomeTax
    const inflation = calculatePercentagePerMonthWithoutValue(netWorth, inflationRate)
    const netInvestmentIncomeMinusInflation = netInvestmentIncome - inflation

    const firstRow = {
        monthIndex: 0,
        referenceMonthYear,
        netWorth,
        netWorthWithoutInflationEffect: calculateValueWithoutInflationEffect(netWorth, inflationRate, 0),
        grossInvestmentIncome,
        investmentIncomeTax,
        netInvestmentIncome,
        contribution: stopContributionInMonths === undefined || 0 < stopContributionInMonths ? contribution : - calculatePercentageTotal(lifestyleMonthlyCost, inflationRate, 0),
        inflation,
        netInvestmentIncomeMinusInflation,
        netInvestmentIncomeMinusInflationWithoutInflationEffect: calculateValueWithoutInflationEffect(netInvestmentIncomeMinusInflation, inflationRate, 0),
        age: calculateAge(birthMonth, referenceMonthYear),
    }

    table.push(firstRow)

    for (let i = 1; i <= yearsAmount * 12; i++) {
        const netWorth = table[i - 1].netWorth + table[i - 1].netInvestmentIncome + table[i - 1].contribution
        const grossInvestmentIncome = calculatePercentagePerMonthWithoutValue(netWorth, interestRate)
        const investmentIncomeTax = calculatePercentagePerMonthWithoutValue(netWorth, interestRate * incomeTaxRate / 100)//calculatePercentage(grossInvestmentIncome, incomeTaxRate)
        const netInvestmentIncome = calculatePercentagePerMonthWithoutValue(netWorth, interestRate - interestRate * incomeTaxRate / 100)//grossInvestmentIncome - investmentIncomeTax
        const inflation = calculatePercentagePerMonthWithoutValue(netWorth, inflationRate)
        const netInvestmentIncomeMinusInflation = netInvestmentIncome - inflation
        const row = {
            monthIndex: i,
            referenceMonthYear: addMonths(month, i),
            netWorth,
            netWorthWithoutInflationEffect: calculateValueWithoutInflationEffect(netWorth, inflationRate, i),
            grossInvestmentIncome,
            investmentIncomeTax,
            netInvestmentIncome,
            contribution: stopContributionInMonths === undefined || i < stopContributionInMonths ? calculatePercentagePerMonth(table[i - 1].contribution, contributionIncreaseRate) : - calculatePercentageTotal(lifestyleMonthlyCost, inflationRate, i),
            inflation,
            netInvestmentIncomeMinusInflation,
            netInvestmentIncomeMinusInflationWithoutInflationEffect: calculateValueWithoutInflationEffect(netInvestmentIncomeMinusInflation, inflationRate, i),
            age: calculateAge(birthMonth, addMonths(month, i))
        }
        table.push(row)
    }
    return table
}

function addMonths(currentMonth, plusMonths) {
    const date = new Date(currentMonth)
    date.setMonth(date.getMonth() + plusMonths)
    return date
}

function formatLongMonthYear(monthYearDate) {
    return monthYearDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

function formatShortMonthYear(monthYearDate) {
    return monthYearDate.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

function formatDateToHTMLYearMonth(yearMonthDate) {
    const year = yearMonthDate.getFullYear()
    let month = yearMonthDate.getMonth() + 1 // Adding 1 because January is 0-indexed
    if (month < 10) {
        month = `0${month}` // Adding leading zero if month is less than 10
    }
    return `${year}-${month}`
}

function calculatePercentageTotal(value, annualPercentage, months) {
    return value * (1 + annualPercentage / 100) ** (months / 12)
}

function calculatePercentagePerMonth(value, annualPercentage) {
    return calculatePercentageTotal(value, annualPercentage, 1)
}

function calculatePercentagePerMonthWithoutValue(value, annualPercentage) {
    return calculatePercentagePerMonth(value, annualPercentage) - value
}

function calculateValueWithoutInflationEffect(value, inflationRate, monthsPassed) {
    return value / (1 + inflationRate / 100) ** (monthsPassed / 12)
}

function calculatePercentage(value, percentage) {
    return value * percentage / 100
}

function calculateAge(startDate, endDate) {
    let diff = endDate.getTime() - startDate.getTime()
    let years = diff / (1000 * 3600 * 24 * 365.25)
    return Math.floor(years)
}

//localStorage.clear()
const datasetItemsHidden = getSavedValue('datasetItemsHidden', [])
let chart

Chart.defaults.font.family = "Segoe UI"
Chart.defaults.font.size = 16

function generateChart(tableData) {
    //if (chart) chart.destroy()

    let splitBy = Math.round(tableData.length / DESIRED_CHART_X_POINTS)
    if (splitBy < 1) splitBy = 1

    const selectedEntries = tableData.filter(entry => entry.monthIndex % splitBy === 0)
    const months = selectedEntries.map(entry =>
        formatShortMonthYear(entry.referenceMonthYear) + " | " +
        formatShortMonthIndex(entry.monthIndex) + " | " +
        entry.age + "yo")

    const datasets = generateDatasets(selectedEntries)
    const labels = months
    const data = {
        labels,
        datasets,
    }
    const config = {
        type: 'line',
        data,
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        callback: function (value) {
                            return formatCurrency(value)
                        }
                    }
                },
                x: {
                    ticks: {
                        minRotation: 90,
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ": " + formatCurrency(context.raw)
                        }
                    }
                },
                legend: {
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                    },
                    onClick: (event, legendItem, legend) => {


                        const datasetIndex = legendItem.datasetIndex
                        const chart = event.chart
                        const meta = chart.getDatasetMeta(datasetIndex)

                        meta.hidden = meta.hidden === null ? !chart.data.datasets[datasetIndex].hidden : null

                        chart.update()

                        datasetItemsHidden[datasetIndex] = meta.hidden
                        saveValue('datasetItemsHidden', datasetItemsHidden)
                    }
                }
            }
        }
    }

    const ctx = document.getElementById('myChart')
    if (!chart) chart = new Chart(ctx, config)
    else {
        chart.data = config.data
        chart.update()
    }
}

let index
function generateDatasets(arrayOfObjects) {
    const datasets = []
    index = 0
    datasets.push(generateDatasetItem(arrayOfObjects, 'netWorth', 'Net worth'))
    datasets.push(generateDatasetItem(arrayOfObjects, 'netWorthWithoutInflationEffect', 'Net worth *'))
    datasets.push(generateDatasetItem(arrayOfObjects, 'grossInvestmentIncome', 'Gross investment income'))
    datasets.push(generateDatasetItem(arrayOfObjects, 'investmentIncomeTax', 'Investment income tax'))
    datasets.push(generateDatasetItem(arrayOfObjects, 'netInvestmentIncome', 'Net investment income'))
    datasets.push(generateDatasetItem(arrayOfObjects, 'contribution', 'Contribution'))
    datasets.push(generateDatasetItem(arrayOfObjects, 'inflation', 'Inflation'))
    datasets.push(generateDatasetItem(arrayOfObjects, 'netInvestmentIncomeMinusInflation', 'Net investment income minus inflation'))
    datasets.push(generateDatasetItem(arrayOfObjects, 'netInvestmentIncomeMinusInflationWithoutInflationEffect', 'Net investment income minus inflation *'))
    return datasets
}

function generateDatasetItem(arrayOfObjects, selectedKeyName, label) {
    const datasetItem = {
        label,
        data: arrayOfObjects.map(object => object[selectedKeyName]),
        fill: true,
        //tension: 0.1,
        hidden: datasetItemsHidden[index] || false,
    }
    index++
    return datasetItem
}

loadDefaultValues()
simulate()