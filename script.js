let companyList = [];
let currentCompanyIndex = -1;

let indicators = [
    { name: 'PE Ratio', meaning: 'Price-to-earnings ratio' },
    { name: 'EPS', meaning: 'Earnings per share' },
    { name: 'ROE', meaning: 'Return on equity' },
    { name: 'Debt-to-Equity', meaning: 'Debt-to-equity ratio' },
    { name: 'Revenue Growth', meaning: 'Year-over-year revenue growth' },
    { name: 'Gross Margin', meaning: 'Gross profit as a percentage of revenue' },
    { name: 'Net Profit Margin', meaning: 'Net profit as a percentage of revenue' },
    { name: 'Free Cash Flow', meaning: 'Free cash flow available to the company' },
    { name: 'Dividend Yield', meaning: 'Annual dividend payments as a percentage of the stock price' },
    {
        name: 'Quick Ratio',
        meaning: 'Ability to meet its short-term liabilities with its most liquid assets'
    },
    {
        name: 'Current Ratio',
        meaning: 'Ability to meet its short-term liabilities with its short-term assets'
    },
    { name: 'Operating Margin', meaning: 'Operating income as a percentage of revenue' },
    { name: 'ROA', meaning: 'Return on assets' },
    {
        name: 'Beta',
        meaning: "Measure of the stock's volatility in relation to the overall market"
    },
    { name: 'PEG Ratio', meaning: 'Price to Earnings Growth' },
    { name: 'Book Value', meaning: 'Net asset value of a company' }
    // Add more indicators as required
];

let currentIndicatorEditing = null;
const CLIENT_ID =
    '355582899135-o2u3e7356nchm1061mctls0qfa2jq7lu.apps.googleusercontent.com'; // Replace with your OAuth Client ID
const API_KEY = ''; // Replace with your API Key
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive';
let gapiInited = false; // track gapi status
let textEditor; // Declare textEditor here

// Function to handle content loading
document.addEventListener('DOMContentLoaded', () => {
    // Example company data
    companyList = [
        { name: 'Company A', symbol: 'A', industry: 'Tech', marketCap: '100B' },
        { name: 'Company B', symbol: 'B', industry: 'Finance', marketCap: '200B' }
    ];
    updateCompanyList();
    showAddCompanyForm();
    textEditor = document.getElementById('textEditor');
});

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
    const index = companyList.findIndex(
        c =>
            c.name === company.name &&
            c.symbol === company.symbol &&
            c.industry === company.industry &&
            c.marketCap === company.marketCap
    );
    if (index === -1) {
        // Handle the case where the company is not found in the list.
        alert('Company not found.');
        return;
    }
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
    displayFiles(company.name);
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

    if (!name || !symbol || !industry || !marketCap) {
        alert('Please fill in all fields.');
        return;
    }
    companyList.push({ name, symbol, industry, marketCap });
    updateCompanyList();
    alert('Company saved!');
    document.getElementById('companyForm').reset();
    showAddCompanyForm();
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
    filteredList.forEach(company => {
        const li = document.createElement('li');
        li.textContent = `${company.name} (${company.symbol})`;
        li.onclick = () => selectCompany(company);
        companyListElement.appendChild(li);
    });
}

// Example function to filter the company list
function filterCompanyList() {
    const query = document.getElementById('searchCompany').value.toLowerCase();
    const filteredList = companyList.filter(
        company =>
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
        // This line is changed, to set the tooltip text directly while generating the table data
        indicatorNameCell.innerHTML += `<span class='tooltiptext'><div class="pasted-content"><p>${indicator.meaning}</p></div></span>`;

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

        tickButton.addEventListener('click', event => {
            event.preventDefault(); // Prevent form submission
            const inputValue = input.value;
            console.log(`Value for ${indicator.name} saved:`, inputValue);
            // Save value to localStorage
            const companyName = document.getElementById('companyName').value;
            localStorage.setItem(`indicator-${companyName}-${indicator.name}`, inputValue);
            tickButton.style.display = 'none';
            editButton.style.display = 'inline-block';
        });

        editButton.addEventListener('click', event => {
            event.preventDefault();
            input.removeAttribute('readonly');
            input.focus();
            tickButton.style.display = 'inline-block';
            editButton.style.display = 'none';
        });
        const actionsCell = document.createElement('td');
         const editIndicatorButton = document.createElement('button');
        editIndicatorButton.textContent = 'Edit';
        editIndicatorButton.classList.add('action-button', 'edit');
        editIndicatorButton.onclick = function(event) {
            event.preventDefault(); // Prevent form submission
            editIndicator(row, indicator.name, indicator.meaning)
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
         deleteButton.classList.add('action-button', 'delete');
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
        const textarea = document.createElement('textarea');
        textarea.value = indicator.meaning;
        textarea.id = `bubble-input-${indicator.name}`;
        textarea.rows = 3;
        editCell.appendChild(textarea);
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
        const textarea = row.cells[2].querySelector('textarea');
        if (textarea) {
            const newMeaning = textarea.value;
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
        alert('Please fill in both fields.');
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
    const addButton = modal.querySelector('.action-button.save');
    addButton.textContent = 'Save';
    addButton.onclick = function(event) {
        event.preventDefault(); // Prevent form submission
        saveEditedIndicator(row, currentName);
    };
}

function saveEditedIndicator(row, currentName) {
    const indicatorName = document.getElementById('newIndicatorName').value;
    const indicatorMeaning = document.getElementById('newIndicatorMeaning').value;

    if (!indicatorName || !indicatorMeaning) {
        alert('Please fill in both fields.');
        return;
    }

    const index = indicators.findIndex(indicator => indicator.name === currentName);

    if (index !== -1) {
        indicators[index] = { name: indicatorName, meaning: indicatorMeaning };
    }
    const modal = document.getElementById('newIndicatorModal');
    modal.style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    const addButton = modal.querySelector('.action-button.save');
    addButton.textContent = 'Add';
    addButton.onclick = function(event) {
        event.preventDefault(); // Prevent form submission
        saveNewIndicator();
    };

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

//Text Editor function
function formatText(command) {
    document.execCommand(command, false, null);
}
function insertLink() {
    const url = prompt('Enter the URL:');
    if (url) {
        document.execCommand('createLink', false, url);
    }
}
function insertList() {
    const listType = prompt("Enter list type ('ul' or 'ol'):", 'ul');
    if (listType === 'ul' || listType === 'ol') {
        document.execCommand('insert' + listType, false, null);
    } else {
        alert("Invalid list type. Please enter 'ul' or 'ol'.");
    }
}

function clearFormat() {
    document.execCommand('removeFormat', false, null);
}

function copyPastedText() {
    document.getElementById('textBoxContainer').style.display = 'block';
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const div = document.createElement('div');
        div.appendChild(range.cloneContents());
        textEditor.innerHTML = div.innerHTML;
    }
    document.getElementById('textBoxContainer').scrollIntoView({ behavior: 'smooth' });
}

// Add file upload functionality
document.getElementById('uploadButton').addEventListener('click', function() {
    document.getElementById('fileInput').click();
});
// This is the corrected event listener, the previous one was on the fileInput which is hidden, and was not causing the method to call
document.getElementById('fileInput').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (!file) return;

    const companyName = document.getElementById('companyName').value;

    if (!companyName) {
        alert('Please select a company first.');
        fileInput.value = ''; // Clear the file input
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const fileData = {
            name: file.name,
            dataURL: e.target.result,
            type: file.type
        };
        saveFile(companyName, fileData);
        displayFiles(companyName);
        fileInput.value = ''; // Clear the file input
    };
    reader.readAsDataURL(file);
}

function saveFile(companyName, fileData) {
    let savedFiles = JSON.parse(localStorage.getItem(`companyFiles-${companyName}`) || '[]');
    savedFiles.push(fileData);
    localStorage.setItem(`companyFiles-${companyName}`, JSON.stringify(savedFiles));
}

function displayFiles(companyName) {
    const fileDisplay = document.getElementById('fileDisplay');
    fileDisplay.innerHTML = '';
    let savedFiles = JSON.parse(localStorage.getItem(`companyFiles-${companyName}`) || '[]');
      if (savedFiles.length == 0) {
        fileDisplay.innerHTML = '<p>No files uploaded</p>';
        return;
    }
    savedFiles.forEach((file, index) => {
        const fileDiv = document.createElement('div');
        fileDiv.classList.add('file-item');

        const fileNameSpan = document.createElement('span');
        fileNameSpan.textContent = file.name;
        fileNameSpan.style.cursor = 'pointer';
        fileNameSpan.addEventListener('click', e => {
            e.preventDefault();
            openFilePreviewModal(file);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'x';
        deleteButton.addEventListener('click', e => {
            e.preventDefault();
            deleteFile(companyName, index);
        });

        fileDiv.appendChild(fileNameSpan);
        fileDiv.appendChild(deleteButton);

        fileDisplay.appendChild(fileDiv);
    });
}

function deleteFile(companyName, fileIndex) {
    let savedFiles = JSON.parse(localStorage.getItem(`companyFiles-${companyName}`) || '[]');
    savedFiles.splice(fileIndex, 1);
    localStorage.setItem(`companyFiles-${companyName}`, JSON.stringify(savedFiles));
    displayFiles(companyName);
}
// Function to open the file preview modal
function openFilePreviewModal(file) {
    const modal = document.getElementById('filePreviewModal');
    const container = document.getElementById('filePreviewContainer');
    container.innerHTML = '';
    let filePreviewElement;
    if(file.type && file.type.startsWith('image/')) {
          filePreviewElement = document.createElement('img');
         filePreviewElement.src = file.dataURL;
          filePreviewElement.alt = file.name;
     }
   else if (file.type && file.type.startsWith('application/pdf')) {
        filePreviewElement = document.createElement('iframe');
            filePreviewElement.src = file.dataURL;
    }
  else if (file.type && file.type.startsWith('text/')) {
       filePreviewElement = document.createElement('iframe');
            filePreviewElement.src = file.dataURL;
    }  else if (file.type && (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
         // Use Google Docs Viewer for Word documents
            filePreviewElement = document.createElement('iframe');
             filePreviewElement.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.dataURL)}`;
    }
    else if (file.type && (file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        // Use Google Docs Viewer for Excel documents
       filePreviewElement = document.createElement('iframe');
     filePreviewElement.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.dataURL)}`;
    }
         else {
      filePreviewElement = document.createElement('p');
         filePreviewElement.textContent = 'File type not supported for direct preview.';
      }


    container.appendChild(filePreviewElement);
    modal.style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
}

// Function to close the file preview modal
function closeFilePreviewModal() {
    document.getElementById('filePreviewModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
}