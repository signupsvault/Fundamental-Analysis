let companyList = [];
let currentCompanyIndex = -1;
let indicators = [
    { name: 'PE Ratio', meaning: 'Price-to-earnings ratio' },
    { name: 'EPS', meaning: 'Earnings per share' },
    { name: 'ROE', meaning: 'Return on equity' }
];

let currentIndicatorEditing = null;
const CLIENT_ID = ''; // Replace with your OAuth Client ID
const API_KEY = 'AIzaSyA2kh0hx23jjIgggkNyfBL4tPjQxdUm7LE';  // Replace with your API Key
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive';
let gapiInited = false; // track gapi status

// Show the form for adding a new company (reset to default)
function showAddCompanyForm() {
    document.getElementById('companyOverview').style.display = 'block';
    document.getElementById('saveBtn').style.display = 'inline-block';
    document.getElementById('updateBtn').style.display = 'none';
    document.getElementById('cancelBtn').style.display = 'none';
    document.getElementById('editBtn').style.display = 'none';
    document.getElementById('deleteBtn').style.display = 'none';
    document.getElementById('companyForm').reset();
    currentCompanyIndex = -1;

    //Explicitly enable the input fields for a new company
    document.getElementById('companyName').disabled = false;
    document.getElementById('companySymbol').disabled = false;
    document.getElementById('companyIndustry').disabled = false;
    document.getElementById('companyMarketCap').disabled = false;
}

// Show the form with the selected company's details (for editing or deleting)
function selectCompany(company) {
    const index = companyList.findIndex(c => c.name === company.name && c.symbol === company.symbol && c.industry === company.industry && c.marketCap === company.marketCap);
    const companySelected = companyList[index];
    document.getElementById('companyName').value = companySelected.name;
    document.getElementById('companySymbol').value = companySelected.symbol;
    document.getElementById('companyIndustry').value = companySelected.industry;
    document.getElementById('companyMarketCap').value = companySelected.marketCap;

    document.getElementById('companyOverview').style.display = 'block';
    document.getElementById('saveBtn').style.display = 'none';
    document.getElementById('updateBtn').style.display = 'none';
    document.getElementById('cancelBtn').style.display = 'none';
    document.getElementById('editBtn').style.display = 'inline-block';
    document.getElementById('deleteBtn').style.display = 'inline-block';

    currentCompanyIndex = index;
    showFundamentalAnalysis();
}

// Show the fundamental analysis section
function showFundamentalAnalysis() {
    document.getElementById('fundamentalAnalysis').style.display = 'block';
    populateFundamentalIndicators();
}

// Triggered when the "Edit" button is clicked
function editCompany() {
    // Make form fields editable
    document.getElementById('companyName').disabled = false;
    document.getElementById('companySymbol').disabled = false;
    document.getElementById('companyIndustry').disabled = false;
    document.getElementById('companyMarketCap').disabled = false;

    // Hide the "Edit" button and show the "Update" and "Cancel" buttons
    document.getElementById('editBtn').style.display = 'none';
    document.getElementById('deleteBtn').style.display = 'none';
    document.getElementById('updateBtn').style.display = 'inline-block';
    document.getElementById('cancelBtn').style.display = 'inline-block';
}

// This function is triggered when the "Update" button is clicked
function updateCompany() {
    const name = document.getElementById('companyName').value;
    const symbol = document.getElementById('companySymbol').value;
    const industry = document.getElementById('companyIndustry').value;
    const marketCap = document.getElementById('companyMarketCap').value;

    if (name && currentCompanyIndex !== -1) {
        // Update the company details in the companyList array
        companyList[currentCompanyIndex] = { name, symbol, industry, marketCap };
        updateCompanyList();
        alert('Company details updated successfully!');

        // Disable the form fields after updating
        document.getElementById('companyName').disabled = true;
        document.getElementById('companySymbol').disabled = true;
        document.getElementById('companyIndustry').disabled = true;
        document.getElementById('companyMarketCap').disabled = true;

        // Show the "Edit" button again and hide "Update" and "Cancel"
        document.getElementById('editBtn').style.display = 'inline-block';
        document.getElementById('deleteBtn').style.display = 'inline-block';
        document.getElementById('updateBtn').style.display = 'none';
        document.getElementById('cancelBtn').style.display = 'none';
    }
}

// This function is triggered when the "Cancel" button is clicked
function cancelEdit() {
    // Revert the form fields back to their initial values (no change)
    selectCompany(companyList[currentCompanyIndex]);

    // Disable the form fields after canceling
    document.getElementById('companyName').disabled = true;
    document.getElementById('companySymbol').disabled = true;
    document.getElementById('companyIndustry').disabled = true;
    document.getElementById('companyMarketCap').disabled = true;

    // Show the "Edit" button again and hide "Update" and "Cancel"
    document.getElementById('editBtn').style.display = 'inline-block';
    document.getElementById('deleteBtn').style.display = 'inline-block';
    document.getElementById('updateBtn').style.display = 'none';
    document.getElementById('cancelBtn').style.display = 'none';
}

// Save a new company (when adding a company)
function saveCompany() {
    const name = document.getElementById('companyName').value;
    const symbol = document.getElementById('companySymbol').value;
    const industry = document.getElementById('companyIndustry').value;
    const marketCap = document.getElementById('companyMarketCap').value;

    if (name) {
        companyList.push({ name, symbol, industry, marketCap });
        updateCompanyList();
        alert('Company saved!');
        document.getElementById('companyForm').reset();
        showAddCompanyForm();
    }
}

// Delete a company from the list
function deleteCompany() {
    if (currentCompanyIndex !== -1) {
        companyList.splice(currentCompanyIndex, 1);
        updateCompanyList();
        alert('Company deleted!');
        document.getElementById('companyForm').reset();
        showAddCompanyForm();
    }
}

// Update the company list (used for adding new companies and showing existing ones)
function updateCompanyList(filteredList = companyList) {
    const companyListElement = document.getElementById('companyListDropdown');
    companyListElement.innerHTML = '';
    filteredList.forEach((company) => {
        const li = document.createElement('li');
        li.textContent = `${company.name} (${company.symbol})`; // Display name and symbol
        li.onclick = () => selectCompany(company);
        companyListElement.appendChild(li);
    });
}

// Example function to filter the company list
function filterCompanyList() {
    const query = document.getElementById('searchCompany').value.toLowerCase();
    const filteredList = companyList.filter(company =>
        company.name.toLowerCase().includes(query) ||
        company.symbol.toLowerCase().includes(query)
    );
    updateCompanyList(filteredList);
}

// Function to populate the fundamental indicators
function populateFundamentalIndicators() {
    const tableBody = document.getElementById('fundamentalList');
    tableBody.innerHTML = '';
    indicators.forEach(indicator => {
        const row = document.createElement('tr');

        const indicatorNameCell = document.createElement('td');
        indicatorNameCell.textContent = indicator.name;
        indicatorNameCell.classList.add('tooltip');
        indicatorNameCell.setAttribute('data-meaning', indicator.meaning);
        indicatorNameCell.innerHTML += `<span class='tooltiptext'>${indicator.meaning}</span>`;

        const indicatorValueCell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter value';
        input.id = `value-input-${indicator.name}`;

           //Load the saved value from localStorage, if available
           const companyName = document.getElementById('companyName').value;
           const savedValue = localStorage.getItem(`indicator-${companyName}-${indicator.name}`);
           if (savedValue) {
               input.value = savedValue;
           }
        indicatorValueCell.appendChild(input);

        const tickButton = document.createElement('button');
        tickButton.textContent = '✔️';
        tickButton.classList.add('tickButton');
        tickButton.style.display = 'inline-block';
        indicatorValueCell.appendChild(tickButton);

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('editButton');
        editButton.style.display = 'none';
        indicatorValueCell.appendChild(editButton);


        tickButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent form submission
            const inputValue = input.value;
            console.log(`Value for ${indicator.name} saved:`, inputValue);
            // Save value to localStorage
            const companyName = document.getElementById('companyName').value;
            localStorage.setItem(`indicator-${companyName}-${indicator.name}`, inputValue);
            tickButton.style.display = 'none';
            editButton.style.display = 'inline-block';
        });

        editButton.addEventListener('click', (event) => {
            event.preventDefault();
            input.removeAttribute('readonly');
            input.focus();
            tickButton.style.display = 'inline-block';
            editButton.style.display = 'none';
        });

        const actionsCell = document.createElement('td');
        const editIndicatorButton = document.createElement('button');
        editIndicatorButton.textContent = 'Edit';
        editIndicatorButton.onclick = function(event) {
             event.preventDefault(); // Prevent form submission
             editIndicator(row, indicator.name, indicator.meaning)
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = function(event) {
             event.preventDefault(); // Prevent form submission
            deleteIndicator(row, indicator.name);
        };

        actionsCell.appendChild(editIndicatorButton);
        actionsCell.appendChild(deleteButton);

        row.appendChild(indicatorNameCell);
        row.appendChild(indicatorValueCell);
        row.appendChild(actionsCell);
        tableBody.appendChild(row);
    });
}


// Initialize the page with sample companies and fundamental indicators
document.addEventListener('DOMContentLoaded', () => {
    // Example company data
    companyList = [
        { name: 'Company A', symbol: 'A', industry: 'Tech', marketCap: '100B' },
        { name: 'Company B', symbol: 'B', industry: 'Finance', marketCap: '200B' }
    ];
    updateCompanyList();
    showAddCompanyForm();
});

// Toggle the display of the bubble editor
function toggleBubbleEditor() {
    const editor = document.getElementById('bubbleEditor');
    const bubbleList = document.getElementById('bubbleList');
    bubbleList.innerHTML = '';
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Indicator Name</th>
                <th>Current Meaning</th>
                <th>Edit Meaning</th>
            </tr>
        </thead>
        <tbody id="bubbleTableBody"></tbody>
    `;

    bubbleList.appendChild(table);

    const bubbleTableBody = document.getElementById('bubbleTableBody');
    indicators.forEach(indicator => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = indicator.name;
        row.appendChild(nameCell);

        const meaningCell = document.createElement('td');
        meaningCell.textContent = indicator.meaning;
        row.appendChild(meaningCell);

        const editCell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = indicator.meaning;
        input.id = `bubble-input-${indicator.name}`;
        editCell.appendChild(input);
        row.appendChild(editCell);

        bubbleTableBody.appendChild(row);
    });

    editor.style.display = 'block';
}

// Save bubble messages
function saveBubbleMessages() {
    const bubbleTableBody = document.getElementById('bubbleTableBody');
    Array.from(bubbleTableBody.rows).forEach(row => {
        const indicatorName = row.cells[0].textContent;
        const input = row.cells[2].querySelector('input');
        if (input) {
            const newMeaning = input.value;
            const indicator = indicators.find(i => i.name === indicatorName);
            if (indicator) {
                indicator.meaning = newMeaning;
            }
        }
    });
    populateFundamentalIndicators();

    document.getElementById('bubbleEditor').style.display = 'none';
    currentIndicatorEditing = null;
}

// Close the bubble editor
function closeBubbleEditor() {
    document.getElementById('bubbleEditor').style.display = 'none';
}

// Function to open the New Indicator modal
function openNewIndicatorModal() {
    document.getElementById('newIndicatorModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
}

// Function to close the New Indicator modal
function closeNewIndicatorModal() {
    document.getElementById('newIndicatorModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
}

// Function to save and add a new indicator to the list
function saveNewIndicator() {
    const indicatorName = document.getElementById('newIndicatorName').value;
    const indicatorMeaning = document.getElementById('newIndicatorMeaning').value;

    if (!indicatorName || !indicatorMeaning) {
        alert("Please fill in both fields.");
        return;
    }

    indicators.push({ name: indicatorName, meaning: indicatorMeaning });
    populateFundamentalIndicators();
    closeNewIndicatorModal();
    document.getElementById('newIndicatorName').value = '';
    document.getElementById('newIndicatorMeaning').value = '';

}
 let rowToBeEdited = null;
function editIndicator(row, currentName, currentMeaning) {
    rowToBeEdited = row;
    const indicatorNameInput = document.getElementById('newIndicatorName');
    const indicatorMeaningInput = document.getElementById('newIndicatorMeaning');

    // Populate the inputs with the current values
    indicatorNameInput.value = currentName;
    indicatorMeaningInput.value = currentMeaning;


     const modal = document.getElementById('newIndicatorModal');
    modal.style.display = 'block';
      document.getElementById('modalOverlay').style.display = 'block';
    const addButton = modal.querySelector('button');
    addButton.textContent = 'Save';
    addButton.onclick = function(event) {
         event.preventDefault(); // Prevent form submission
        saveEditedIndicator(row, currentName) }


}

function saveEditedIndicator(row, currentName) {
    const indicatorName = document.getElementById('newIndicatorName').value;
    const indicatorMeaning = document.getElementById('newIndicatorMeaning').value;

    if (!indicatorName || !indicatorMeaning) {
        alert("Please fill in both fields.");
        return;
    }

    const index = indicators.findIndex(indicator => indicator.name === currentName);

    if (index !== -1) {
        indicators[index] = { name: indicatorName, meaning: indicatorMeaning };
    }
    const modal = document.getElementById('newIndicatorModal');
    modal.style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    const addButton = modal.querySelector('button');
    addButton.textContent = 'Add';
    addButton.onclick = function(event) {
         event.preventDefault(); // Prevent form submission
        saveNewIndicator(); }

    document.getElementById('newIndicatorName').value = '';
    document.getElementById('newIndicatorMeaning').value = '';

    populateFundamentalIndicators();
}

function deleteIndicator(row, indicatorName) {
    const index = indicators.findIndex(indicator => indicator.name === indicatorName);
    if (index > -1) {
      indicators.splice(index, 1);
       }
    const tableBody = document.getElementById('fundamentalList');
    tableBody.removeChild(row);
}