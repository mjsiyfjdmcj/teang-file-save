document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const trainingId = urlParams.get('id');
    
    if (!trainingId) {
        window.location.href = 'index.html';
        return;
    }
    
    loadTrainingDetails(trainingId);
});

function loadTrainingDetails(id) {
    const trainings = JSON.parse(localStorage.getItem('trainings')) || [];
    const training = trainings.find(t => t.id === id);
    
    if (!training) {
        document.getElementById('training-content').innerHTML = `
            <div class="training-detail-card">
                <h2>Training Not Found</h2>
                <p>The requested training could not be found.</p>
                <a href="index.html" class="btn btn-primary">Back to Home</a>
            </div>
        `;
        return;
    }
    
    document.getElementById('training-content').innerHTML = `
        <div class="training-detail-card">
            <h2>${training.name}</h2>
            
            <div class="detail-info">
                <h3>Organization</h3>
                <p>${training.organization}</p>
            </div>
            
            <div class="detail-info">
                <h3>Date & Time</h3>
                <p>${formatDateTime(training.dateTime)}</p>
            </div>
            
            <div class="detail-info">
                <h3>Training Fee</h3>
                <p>$${training.fee}</p>
            </div>
            
            ${training.discountCode ? `
                <div class="detail-info">
                    <h3>Discount Code</h3>
                    <p>${training.discountCode}</p>
                </div>
            ` : ''}
            
            <div class="detail-info">
                <h3>Description</h3>
                <p>${training.description}</p>
            </div>
            
            <div class="apply-section">
                <h3>Ready to Join?</h3>
                <p>Don't miss this opportunity to enhance your English skills!</p>
                <button class="btn btn-success" onclick="applyNow('${training.name}')">Apply Now</button>
            </div>
        </div>
    `;
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

function applyNow(trainingName) {
    alert(`Thank you for your interest in "${trainingName}"! Please contact us to complete your application.`);
}