// Data
let requests = [
    { date: "12 Feb 2026", hospital: "Mustapha Hospital", status: "pending" },
    { date: "03 June 2025", hospital: "El Kettar Hospital", status: "fulfilled" },
    { date: "03 Mar 2025", hospital: "Maillot Hospital", status: "fulfilled" },
    
];

// Show list dynamically
function showList() {
    let container = document.getElementById("historyList");
    let html = "";
    
    for (let i = 0; i < requests.length; i++) {
        let item = requests[i];
        let statusClass = item.status === "pending" ? "status-Pending" : "status-Fulfilled";
        let statusText = item.status === "pending" ? "Pending" : "Fulfilled";
        let isChecked = item.status === "fulfilled" ? "checked" : "";
        
        html += `
            <div class="history-item">
                <div class="drop-div">
                    <img class="drop-pic" src="images/Blur2.svg" alt="drop">
                </div>
                <div class="hos-date-div">
                    <div class="history-date">${item.date}</div>
                    <div class="history-hospital"> ${item.hospital}</div>
                </div>
                <div class="checkbox-div">
                    <input class="checkbox-status" type="checkbox" ${isChecked}>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
            </div>
        `;
    }
    
    if (html === "") {
        html = "<div class='empty-state'>No requests found</div>";
    }
    
    container.innerHTML = html;
    setupCheckboxes();
}

// Handle checkbox change - FIXED (only change text and color, not className)
function setupCheckboxes() {
    // Get all checkboxes
    let checkboxes = document.querySelectorAll('.checkbox-status');
    
    // Go through each checkbox
    for (let i = 0; i < checkboxes.length; i++) {
        let checkbox = checkboxes[i];
        
        // When checkbox is clicked
        checkbox.onclick = function() {
            // Find the status text next to this checkbox
            let status = this.parentElement.querySelector('.status-badge');
            
            // If checked, show "Fulfilled"
            if (this.checked) {
                status.innerHTML = "Fulfilled";
                status.classList.remove('status-Pending');
                status.classList.add('status-Fulfilled');
            } 
            // If not checked, show "Pending"
            else {
                status.innerHTML = "Pending";
                status.classList.remove('status-Fulfilled');
                status.classList.add('status-Pending');
            }
        };
    }
}

// Start
showList();
//crete the two tables
document.addEventListener('DOMContentLoaded', function() {
    // Create blood type dropdown
    const bloodDropdown = document.createElement('div');
    bloodDropdown.id = 'dropdown';
    bloodDropdown.className = 'dropdown';
    bloodDropdown.innerHTML = `
        <table>
            <tr><td onclick="selectBlood(this,'O+')">O+</td><td onclick="selectBlood(this,'O-')">O-</td></tr>
            <tr><td onclick="selectBlood(this,'A+')">A+</td><td onclick="selectBlood(this,'A-')">A-</td></tr>
            <tr><td onclick="selectBlood(this,'B+')">B+</td><td onclick="selectBlood(this,'B-')">B-</td></tr>
            <tr><td onclick="selectBlood(this,'AB+')">AB+</td><td onclick="selectBlood(this,'AB-')">AB-</td></tr>
         </table>
    `;
    document.body.appendChild(bloodDropdown);
    
    // Create state dropdown
    const stateDropdown = document.createElement('div');
    stateDropdown.id = 'stateDropdown';
    stateDropdown.className = 'state-dropdown';
     stateDropdown.style.display = 'none';
    stateDropdown.innerHTML = `
        <table>
            <tr>
                <td class="urgent-option" onclick="selectState(this,'Urgent')" style="color: #E33E3E;">Urgent</td>
                <td class="stable-option" onclick="selectState(this,'Stable')" style="color: #EA9A60;">Stable</td>
            </tr>
        </table>
    `;
    document.body.appendChild(stateDropdown);
});

function toggleDropdown() {
    const dropdown = document.getElementById('dropdown');
    const arrow = document.getElementById('arrow-icon');
    const stateDropdown = document.getElementById('stateDropdown');

    if (stateDropdown) stateDropdown.style.display = "none";
    
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
        document.body.classList.remove('dropdown-open'); // remove active style
    } else {
        const rect = arrow.getBoundingClientRect();
        dropdown.style.top = rect.bottom + window.scrollY- 1.1 + 'px';
        dropdown.style.left = rect.left + window.scrollX + 'px';
        dropdown.style.display = "block";

        document.body.classList.add('dropdown-open'); // apply active style
    }
}

function toggleStateDropdown() {
    const dropdown = document.getElementById('stateDropdown');
    const stateIcon = document.getElementById('state-icon');
    const bloodDropdown = document.getElementById('dropdown');
    
    if (bloodDropdown) bloodDropdown.style.display = "none";
    
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        const rect = stateIcon.getBoundingClientRect();
        dropdown.style.position = 'absolute';
        dropdown.style.top = rect.bottom + window.scrollY + 0 + 'px';
        dropdown.style.left = rect.left + window.scrollX + 'px';
        dropdown.style.display = "block";
    }
}

function selectBlood(element, value) {
    const bloodDiv = document.getElementById('arrow-icon'); // dropdown display
    const dropdown = document.getElementById('dropdown');
    bloodDiv.childNodes[0].nodeValue = value; // update dropdown text

    // Update first div blood type text
    const bloodTypeText = document.querySelector('.bloodtype-text');
    bloodTypeText.innerText = value; // set the text

    dropdown.style.display = "none";
    document.body.classList.remove('dropdown-open');
}

function selectState(element, value) {
    const stateDiv = document.getElementById('state-icon');
    const dropdown = document.getElementById('stateDropdown');
    stateDiv.childNodes[0].nodeValue = value;
    if (value === 'Urgent') {
        stateDiv.style.color = '#E33E3E';
    } else {
        stateDiv.style.color = '#EA9A60';
    }
    dropdown.style.display = "none";
}

// Close dropdowns when clicking outside
// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    const bloodDropdown = document.getElementById('dropdown');
    const stateDropdown = document.getElementById('stateDropdown');
    const bloodIcon = document.getElementById('arrow-icon');
    const stateIcon = document.getElementById('state-icon');

    // Blood dropdown
    if (bloodDropdown && bloodIcon && !bloodDropdown.contains(e.target) && !bloodIcon.contains(e.target)) {
        bloodDropdown.style.display = "none";
        document.body.classList.remove('dropdown-open'); // Remove border style
    }

    // State dropdown
    if (stateDropdown && stateIcon && !stateDropdown.contains(e.target) && !stateIcon.contains(e.target)) {
        stateDropdown.style.display = "none";
        // For state dropdown, you probably don't need dropdown-open, 
        // but if you did use it, remove it here too
    }
});
// For edit button
// For edit button
const editBtn = document.querySelector('.edit2-div');
const wrapper = document.querySelector('.dd-wrapper'); // second-div info wrapper
let isEditing = false;

editBtn.onclick = (e) => {
    e.stopPropagation(); // prevent dropdown close
    
    const buttonText = editBtn.querySelector('.edit2'); // your text span inside button

    if (!isEditing) {
        // Start editing
        isEditing = true;
        buttonText.innerText = "Save"; // change button text

        const items = wrapper.querySelectorAll('.dd-item');

        items.forEach((item, index) => {
            const input = document.createElement('input');
            input.value = item.innerText;
            input.className = 'edit-input';
            input.dataset.index = index;

            item.innerHTML = '';
            item.appendChild(input);
        });

    } else {
        // Save changes
        const inputs = wrapper.querySelectorAll('.edit-input');
        const items = wrapper.querySelectorAll('.dd-item');

        inputs.forEach((input, i) => {
            items[i].innerHTML = input.value; // update item text
        });

        // ALSO update first div
        const nameDiv = document.querySelector('.name');
        const locationDiv = document.querySelector('.position span');

        nameDiv.innerText = items[0].innerText; // Full Name
        locationDiv.innerText = items[4].innerText; // Location

        isEditing = false;
        buttonText.innerText = "Edit"; // change back to Edit
    }
};
document.addEventListener('DOMContentLoaded', function() {
    const sm1Img = document.querySelector('.sm1-img');
    const sm2Img = document.querySelector('.sm2-img');
    const sm3Img = document.querySelector('.sm3-img');
    const sm4Img = document.querySelector('.sm4-img');
    
    if (sm1Img) {// Check if the image exists on the page
        const originalSrc1 = sm1Img.src;
        sm1Img.addEventListener('mouseenter', () => {
            sm1Img.src = 'images/Vector23.svg';
            
        });
        
        sm1Img.addEventListener('mouseleave', () => {
            sm1Img.src = originalSrc1;
            
        });
    }
    
    if (sm2Img) {
        const originalSrc2 = sm2Img.src;
        sm2Img.addEventListener('mouseenter', () => {
            sm2Img.src = 'images/Vector20.svg';
        });
        
        sm2Img.addEventListener('mouseleave', () => {
            sm2Img.src = originalSrc2;
            
        });
    }
    
    if (sm3Img) {
        const originalSrc3 = sm3Img.src;
        sm3Img.addEventListener('mouseenter', () => {
            sm3Img.src = 'images/Vector22.svg';
        });
        
        sm3Img.addEventListener('mouseleave', () => {
            sm3Img.src = originalSrc3;
        });
    }
    if (sm4Img) {
        const originalSrc4 = sm4Img.src;
        sm4Img.addEventListener('mouseenter', () => {
            sm4Img.src = 'images/Vector21.svg';
            
        });
        
        sm4Img.addEventListener('mouseleave', () => {
            sm4Img.src = originalSrc4;
        });
    }
});
//to edit profile pic
    editPhotoBtn.onclick = function() {
         fileInput.click(); 
        };//when we click it the folder will open
    fileInput.onchange = function(e) {
         profileImage.src = URL.createObjectURL(e.target.files[0]);
         };


         