// Check if admin is logged in
document.addEventListener('DOMContentLoaded', function() {
    if (!sessionStorage.getItem('adminLoggedIn')) {
        window.location.href = 'admin.html';
        return;
    }
    
    loadTrainingsList();
    loadHistory();
    
    document.getElementById('training-form').addEventListener('submit', handleFormSubmit);
});

function handleFormSubmit(e) {
    e.preventDefault();
    
    const editId = document.getElementById('edit-id').value;
    const training = {
        id: editId || Date.now().toString(),
        name: document.getElementById('training-name').value,
        description: document.getElementById('training-description').value,
        organization: document.getElementById('organization').value,
        dateTime: document.getElementById('date-time').value,
        fee: document.getElementById('fee').value,
        discountCode: document.getElementById('discount-code').value
    };
    
    const method = editId ? 'PUT' : 'POST';
    
    fetch('training_api.php', {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(training)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Reset form
            document.getElementById('training-form').reset();
            document.getElementById('edit-id').value = '';
            document.getElementById('form-title').innerHTML = '<i class="fas fa-plus-circle"></i> Add New Training';
            document.getElementById('submit-btn').innerHTML = '<i class="fas fa-save"></i> Add Training';
            document.getElementById('cancel-btn').style.display = 'none';
            
            loadTrainingsList();
            loadHistory();
            
            alert(editId ? 'Training updated successfully!' : 'Training added successfully!');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving training. Please try again.');
    });
}

function loadTrainingsList() {
    fetch('training_api.php')
        .then(response => response.json())
        .then(trainings => {
            const container = document.getElementById('trainings-list');
            
            if (trainings.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>No Trainings Yet</h3>
                        <p>Start by adding your first training program using the form above.</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = trainings.map(training => `
                <div class="training-item">
                    <div class="training-item-info">
                        <h4><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(training.name)}</h4>
                        <p><i class="fas fa-building"></i> <strong>Organization:</strong> ${escapeHtml(training.organization)}</p>
                        <p><i class="fas fa-calendar-alt"></i> <strong>Date:</strong> ${formatDateTime(training.dateTime)}</p>
                        <p><i class="fas fa-money-bill-wave"></i> <strong>Fee:</strong> ৳${training.fee}</p>
                    </div>
                    <div class="training-item-actions">
                        <button class="btn btn-edit" onclick="editTraining('${training.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-delete" onclick="deleteTraining('${training.id}')"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading trainings:', error);
        });
}

function editTraining(id) {
    fetch('training_api.php')
        .then(response => response.json())
        .then(trainings => {
            const training = trainings.find(t => t.id == id);
            
            if (training) {
                document.getElementById('edit-id').value = training.id;
                document.getElementById('training-name').value = training.name;
                document.getElementById('training-description').value = training.description;
                document.getElementById('organization').value = training.organization;
                document.getElementById('date-time').value = training.dateTime;
                document.getElementById('fee').value = training.fee;
                document.getElementById('discount-code').value = training.discountCode || '';
                
                document.getElementById('form-title').innerHTML = '<i class="fas fa-edit"></i> Edit Training';
                document.getElementById('submit-btn').innerHTML = '<i class="fas fa-save"></i> Update Training';
                document.getElementById('cancel-btn').style.display = 'inline-block';
                
                // Scroll to form
                document.querySelector('.add-training').scrollIntoView({ behavior: 'smooth' });
            }
        });
}

function deleteTraining(id) {
    if (confirm('Are you sure you want to delete this training?')) {
        fetch(`training_api.php?id=${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadTrainingsList();
                alert('Training deleted successfully!');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting training. Please try again.');
        });
    }
}

function cancelEdit() {
    document.getElementById('training-form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('form-title').innerHTML = '<i class="fas fa-plus-circle"></i> Add New Training';
    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-save"></i> Add Training';
    document.getElementById('cancel-btn').style.display = 'none';
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin.html';
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

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Find and activate the clicked button
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if (btn.textContent.includes(tabName === 'current' ? 'Current Posts' : 'History')) {
            btn.classList.add('active');
        }
    });
}

function loadHistory() {
    fetch('training_api.php?action=history')
        .then(response => response.json())
        .then(history => {
            const container = document.getElementById('history-list');
            
            if (history.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <h3>No History Found</h3>
                        <p>Training history will appear here once you start adding and editing trainings.</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = history.map(training => `
                <div class="training-item history-item">
                    <div class="training-item-info">
                        <h4><i class="fas fa-chalkboard-teacher"></i> ${escapeHtml(training.name)}</h4>
                        <p><i class="fas fa-building"></i> <strong>Organization:</strong> ${escapeHtml(training.organization)}</p>
                        <p><i class="fas fa-calendar-alt"></i> <strong>Date:</strong> ${formatDateTime(training.dateTime)}</p>
                        <p><i class="fas fa-money-bill-wave"></i> <strong>Fee:</strong> ৳${training.fee}</p>
                        <p><i class="fas fa-clock"></i> <strong>Saved:</strong> ${training.saved_at}</p>
                    </div>
                    <div class="training-item-actions">
                        <button class="btn btn-success" onclick="restoreTraining('${training.id}')"><i class="fas fa-redo"></i> Restore</button>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading history:', error);
        });
}

function restoreTraining(historyId) {
    if (confirm('Are you sure you want to restore this training post?')) {
        fetch('training_api.php?action=restore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({historyId: historyId})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadTrainingsList();
                alert('Training restored successfully!');
            } else {
                alert('Error restoring training: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error restoring training. Please try again.');
        });
    }
}