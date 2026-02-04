// Replace these with your actual EmailJS keys
const EMAILJS_PUBLIC_KEY = 'O2dOaxD4PU1ubsC8x';
const EMAILJS_SERVICE_ID = 'election-2026';
const EMAILJS_TEMPLATE_ID = 'template_obztdyo';

// Initialize EmailJS when available
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

// Email form handling (index.html)
if (document.getElementById('emailForm')) {
    console.log('Email form found, setting up listener');
    document.getElementById('emailForm').addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        
        const email = document.getElementById('email').value.trim();
        console.log('Email entered:', email);
        
        // Check if email already exists
        const existingEmails = JSON.parse(localStorage.getItem('pollEmails') || '[]');
        console.log('Existing emails:', existingEmails);
        
        if (existingEmails.includes(email)) {
            showError("You've already voted buddy....Don't do Jhyalley");
            return;
        }
        
        // Store email and redirect to poll
        sessionStorage.setItem('currentUserEmail', email);
        console.log('Redirecting to poll.html');
        window.location.href = 'poll.html';
    });
}

// Poll form handling (poll.html)
console.log('Checking for pollForm:', document.getElementById('pollForm'));
if (document.getElementById('pollForm')) {
    console.log('pollForm found, setting up event listener');
    const userEmail = sessionStorage.getItem('currentUserEmail');
    if (!userEmail) {
        window.location.href = 'index.html';
    } else {
        // Check if this email has already voted
        const existingEmails = JSON.parse(localStorage.getItem('pollEmails') || '[]');
        if (existingEmails.includes(userEmail)) {
            // User already voted - show their previous vote
            showPreviousVote(userEmail);
        } else {
            // User hasn't voted yet - show the form
            document.getElementById('user-email').textContent = `Voting as: ${userEmail}`;
            
            // Initialize seat calculation
            try {
                initializeSeatCalculation();
            } catch (error) {
                console.log('Seat calculation initialization failed:', error);
            }
            
            document.getElementById('pollForm').addEventListener('submit', function(e) {
                console.log('Poll form submitted!');
                e.preventDefault();
                
                // Validate seat distribution before submitting
                console.log('Validating seat distribution...');
                if (!validateSeatDistribution()) {
                    console.log('Seat validation failed!');
                    return;
                }
                console.log('Seat validation passed!');
                
                const formData = new FormData(this);
                console.log('Form data collected');
                const votes = {
                    email: userEmail,
                    winner: formData.get('winner'),
                    seats: formData.get('seats'),
                    renu_sobita: formData.get('renu_sobita'),
                    gagan_amresh: formData.get('gagan_amresh'),
                    mahesh_rajib: formData.get('mahesh_rajib'),
                    pm: formData.get('pm'),
                    seat_predictions: {
                        rsp: { direct: parseInt(formData.get('rsp_direct')), pr: parseInt(formData.get('rsp_pr')) },
                        congress: { direct: parseInt(formData.get('congress_direct')), pr: parseInt(formData.get('congress_pr')) },
                        uml: { direct: parseInt(formData.get('uml_direct')), pr: parseInt(formData.get('uml_pr')) },
                        shram: { direct: parseInt(formData.get('shram_direct')), pr: parseInt(formData.get('shram_pr')) },
                        ujyalo: { direct: parseInt(formData.get('ujyalo_direct')), pr: parseInt(formData.get('ujyalo_pr')) },
                        others: { direct: parseInt(formData.get('others_direct')), pr: parseInt(formData.get('others_pr')) }
                    },
                    timestamp: new Date().toISOString()
                };
                
                // Save vote to localStorage
                saveVote(votes);
                
                // Send confirmation email and wait before redirecting
                sendConfirmationEmail(votes);
                
                // Store votes for results page
                sessionStorage.setItem('lastVote', JSON.stringify(votes));
                
                // Delay redirect to allow email to send
                console.log('Waiting 2 seconds before redirect...');
                setTimeout(() => {
                    window.location.href = 'results.html';
                }, 2000);
            });
        }
    }
}

function saveVote(votes) {
    // Save email to prevent duplicate voting
    const existingEmails = JSON.parse(localStorage.getItem('pollEmails') || '[]');
    existingEmails.push(votes.email);
    localStorage.setItem('pollEmails', JSON.stringify(existingEmails));
    
    // Save vote data
    const allVotes = JSON.parse(localStorage.getItem('pollVotes') || '[]');
    allVotes.push(votes);
    localStorage.setItem('pollVotes', JSON.stringify(allVotes));
}

function sendConfirmationEmail(votes) {
    console.log('sendConfirmationEmail called with:', votes);
    
    if (typeof emailjs === 'undefined') {
        console.log('EmailJS not available - email sending skipped');
        return;
    }
    
    console.log('EmailJS is available, preparing to send email');
    
    // Format seat predictions for email
    const seatPredictions = `
Seat Predictions (Total: 275):
- RSP: ${votes.seat_predictions.rsp.direct} Direct + ${votes.seat_predictions.rsp.pr} PR = ${votes.seat_predictions.rsp.direct + votes.seat_predictions.rsp.pr}
- Congress: ${votes.seat_predictions.congress.direct} Direct + ${votes.seat_predictions.congress.pr} PR = ${votes.seat_predictions.congress.direct + votes.seat_predictions.congress.pr}
- UML: ${votes.seat_predictions.uml.direct} Direct + ${votes.seat_predictions.uml.pr} PR = ${votes.seat_predictions.uml.direct + votes.seat_predictions.uml.pr}
- Shram Sanskriti: ${votes.seat_predictions.shram.direct} Direct + ${votes.seat_predictions.shram.pr} PR = ${votes.seat_predictions.shram.direct + votes.seat_predictions.shram.pr}
- Ujyalo Nepal: ${votes.seat_predictions.ujyalo.direct} Direct + ${votes.seat_predictions.ujyalo.pr} PR = ${votes.seat_predictions.ujyalo.direct + votes.seat_predictions.ujyalo.pr}
- Others: ${votes.seat_predictions.others.direct} Direct + ${votes.seat_predictions.others.pr} PR = ${votes.seat_predictions.others.direct + votes.seat_predictions.others.pr}`;
    
    const templateParams = {
        to_email: 'hritikpathak97@gmail.com', // Send to your email
        user_email: votes.email, // Include user's email in the message
        winner_vote: votes.winner,
        seats_vote: votes.seats,
        renu_sobita_vote: votes.renu_sobita,
        gagan_amresh_vote: votes.gagan_amresh,
        mahesh_rajib_vote: votes.mahesh_rajib,
        pm_vote: votes.pm,
        seat_predictions: seatPredictions,
        vote_date: new Date(votes.timestamp).toLocaleDateString()
    };
    
    console.log('Template params:', templateParams);
    
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(function(response) {
            console.log('Email sent successfully:', response);
        })
        .catch(function(error) {
            console.log('Email sending failed:', error);
        });
}

function showPreviousVote(email) {
    const allVotes = JSON.parse(localStorage.getItem('pollVotes') || '[]');
    const userVote = allVotes.find(vote => vote.email === email);
    
    if (userVote) {
        document.getElementById('user-email').textContent = `You have already voted! (${email})`;
        
        // Show their previous selections
        const form = document.getElementById('pollForm');
        form.innerHTML = `
            <div class="question">
                <h3>Your Previous Vote:</h3>
                <div class="vote-summary">
                    <p><strong>Winner:</strong> ${userVote.winner}</p>
                    <p><strong>Most Seats:</strong> ${userVote.seats}</p>
                    <p><strong>Renu vs Sobita:</strong> ${userVote.renu_sobita}</p>
                    <p><strong>Gagan vs Amresh:</strong> ${userVote.gagan_amresh}</p>
                    <p><strong>Mahesh vs Rajib:</strong> ${userVote.mahesh_rajib}</p>
                    <p><strong>Prime Minister:</strong> ${userVote.pm}</p>
                    <p><strong>Voted on:</strong> ${new Date(userVote.timestamp).toLocaleDateString()}</p>
                </div>
                <button type="button" onclick="window.location.href='index.html'">Vote with Different Email</button>
            </div>
        `;
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    } else {
        alert(message);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.classList.remove('hidden');
    }
}

// Debug function to view all votes (for development)
function viewAllVotes() {
    const votes = JSON.parse(localStorage.getItem('pollVotes') || '[]');
    console.log('All votes:', votes);
    return votes;
}

// Reset function for testing (for development)
function resetAllData() {
    localStorage.removeItem('pollEmails');
    localStorage.removeItem('pollVotes');
    sessionStorage.clear();
    console.log('All poll data cleared!');
    alert('All data cleared! You can now test with fresh emails.');
}

// Results page handling (results.html)
if (document.getElementById('user-votes')) {
    const lastVote = JSON.parse(sessionStorage.getItem('lastVote') || '{}');
    const userEmail = lastVote.email || 'Unknown';
    
    if (lastVote.email) {
        document.getElementById('user-email').textContent = `Thanks for voting: ${userEmail}`;
        
        document.getElementById('user-votes').innerHTML = `
            <p><strong>Winner:</strong> ${lastVote.winner}</p>
            <p><strong>Most Seats:</strong> ${lastVote.seats}</p>
            <p><strong>Renu vs Sobita:</strong> ${lastVote.renu_sobita}</p>
            <p><strong>Gagan vs Amresh:</strong> ${lastVote.gagan_amresh}</p>
            <p><strong>Mahesh vs Rajib:</strong> ${lastVote.mahesh_rajib}</p>
            <p><strong>Prime Minister:</strong> ${lastVote.pm}</p>
            <p><strong>Voted on:</strong> ${new Date(lastVote.timestamp).toLocaleDateString()}</p>
        `;
    } else {
        window.location.href = 'index.html';
    }
}

function shareResults() {
    const lastVote = JSON.parse(sessionStorage.getItem('lastVote') || '{}');
    const text = `I just voted in Election 2026 poll! My predictions: Winner: ${lastVote.winner}, Most Seats: ${lastVote.seats}, PM: ${lastVote.pm}. But we all know the real winner will be Ghanti! 🔔😄`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Election 2026 Poll Results',
            text: text
        });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Results copied to clipboard!');
        });
    }
}

// Seat calculation functions
function initializeSeatCalculation() {
    console.log('Initializing seat calculation');
    const seatInputs = document.querySelectorAll('.seat-input');
    console.log('Found seat inputs:', seatInputs.length);
    seatInputs.forEach(input => {
        input.addEventListener('input', calculateSeats);
    });
    calculateSeats(); // Initial calculation
}

function calculateSeats() {
    console.log('Calculating seats');
    let totalDirect = 0;
    let totalPR = 0;
    
    // Calculate totals
    document.querySelectorAll('.seat-input.direct').forEach(input => {
        totalDirect += parseInt(input.value) || 0;
    });
    
    document.querySelectorAll('.seat-input.pr').forEach(input => {
        totalPR += parseInt(input.value) || 0;
    });
    
    const grandTotal = totalDirect + totalPR;
    
    // Update display
    const totalDirectEl = document.getElementById('total-direct');
    const totalPREl = document.getElementById('total-pr');
    const grandTotalEl = document.getElementById('grand-total');
    
    if (totalDirectEl) totalDirectEl.textContent = totalDirect;
    if (totalPREl) totalPREl.textContent = totalPR;
    if (grandTotalEl) grandTotalEl.textContent = grandTotal;
    
    // Show errors if any
    const errorDiv = document.getElementById('seat-error');
    if (errorDiv) {
        let errors = [];
        
        if (totalDirect > 165) errors.push('Direct seats exceed 165');
        if (totalPR > 110) errors.push('PR seats exceed 110');
        if (grandTotal !== 275) errors.push(`Total must be exactly 275 (currently ${grandTotal})`);
        
        if (errors.length > 0) {
            errorDiv.textContent = errors.join(', ');
            errorDiv.classList.remove('hidden');
        } else {
            errorDiv.classList.add('hidden');
        }
    }
}

function validateSeatDistribution() {
    console.log('validateSeatDistribution called');
    
    // Check if seat inputs exist
    const seatInputs = document.querySelectorAll('.seat-input');
    if (seatInputs.length === 0) {
        console.log('No seat inputs found, skipping validation');
        return true; // Skip validation if no seat inputs
    }
    
    let totalDirect = 0;
    let totalPR = 0;
    
    document.querySelectorAll('.seat-input.direct').forEach(input => {
        totalDirect += parseInt(input.value) || 0;
    });
    
    document.querySelectorAll('.seat-input.pr').forEach(input => {
        totalPR += parseInt(input.value) || 0;
    });
    
    const grandTotal = totalDirect + totalPR;
    console.log(`Seat totals: Direct=${totalDirect}, PR=${totalPR}, Grand=${grandTotal}`);
    
    if (totalDirect > 165 || totalPR > 110 || grandTotal !== 275) {
        alert('Please fix seat distribution errors before submitting!');
        return false;
    }
    
    return true;
}