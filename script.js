// Load and display trainings on homepage
document.addEventListener('DOMContentLoaded', function() {
    loadTrainings();
});

function loadTrainings() {
    fetch('training_api.php')
        .then(response => response.json())
        .then(trainings => {
            const container = document.getElementById('trainings-container');
            
            if (trainings.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666; font-size: 1.2rem; margin: 2rem;">No trainings available at the moment.</p>';
                return;
            }
            
            container.innerHTML = trainings.map(training => `
                <div class="training-card">
                    <h3><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(training.name)}</h3>
                    <div class="training-info">
                        <span><i class="fas fa-building"></i> <strong>Organization:</strong> ${escapeHtml(training.organization)}</span>
                        <span><i class="fas fa-calendar-alt"></i> <strong>Date & Time:</strong> ${formatDateTime(training.dateTime)}</span>
                        <span><i class="fas fa-money-bill-wave"></i> <strong>Fee:</strong> ৳${training.fee}</span>
                        ${training.discountCode ? `<span><i class="fas fa-tag"></i> <strong>Discount Code:</strong> ${escapeHtml(training.discountCode)}</span>` : ''}
                    </div>
                    <p><i class="fas fa-info-circle"></i> ${escapeHtml(training.description.substring(0, 150))}${training.description.length > 150 ? '...' : ''}</p>
                    <div class="training-actions">
                        <a href="details.html?id=${training.id}" class="btn btn-primary"><i class="fas fa-eye"></i> View Details</a>
                        <button class="btn btn-success" onclick="applyNow('${escapeHtml(training.name)}')"><i class="fas fa-paper-plane"></i> Apply Now</button>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading trainings:', error);
            document.getElementById('trainings-container').innerHTML = '<p style="text-align: center; color: #e74c3c;">Error loading trainings. Please try again later.</p>';
        });
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function applyNow(trainingName) {
    window.open('https://forms.gle/eu4ZGNkZT5RNfhAp9', '_blank');
}