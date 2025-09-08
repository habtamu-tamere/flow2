const API_URL = 'http://localhost:3000/api';
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  loadCampaigns();
  loadInfluencers();

  // Modal functionality
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const campaignModal = document.getElementById('campaignModal');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const createCampaignBtn = document.getElementById('createCampaignBtn');
  const switchToRegister = document.getElementById('switchToRegister');
  const switchToLogin = document.getElementById('switchToLogin');
  const closeButtons = document.querySelectorAll('.close-modal');

  loginBtn.addEventListener('click', () => (loginModal.style.display = 'flex'));
  registerBtn.addEventListener('click', () => (registerModal.style.display = 'flex'));
  createCampaignBtn.addEventListener('click', () => (campaignModal.style.display = 'flex'));

  switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
  });

  switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
  });

  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      loginModal.style.display = 'none';
      registerModal.style.display = 'none';
      campaignModal.style.display = 'none';
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === loginModal) loginModal.style.display = 'none';
    if (e.target === registerModal) registerModal.style.display = 'none';
    if (e.target === campaignModal) campaignModal.style.display = 'none';
  });

  // Form submissions
  document.querySelector('#loginModal .auth-form').addEventListener('submit', handleLogin);
  document.querySelector('#registerModal .auth-form').addEventListener('submit', handleRegister);
  document.querySelector('#campaignModal .auth-form').addEventListener('submit', handleCreateCampaign);

  // Apply filters
  document.querySelectorAll('.filters .btn-primary').forEach(button => {
    button.addEventListener('click', () => {
      if (document.getElementById('campaigns-tab').classList.contains('active')) {
        loadCampaigns();
      } else {
        loadInfluencers();
      }
    });
  });
});

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabName + '-tab').classList.add('active');
  event.currentTarget.classList.add('active');
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    localStorage.setItem('token', response.data.token);
    currentUser = response.data.user;
    updateUI();
    document.getElementById('loginModal').style.display = 'none';
  } catch (error) {
    alert(error.response?.data?.error || 'Login failed');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const role = document.getElementById('register-role').value;
  const tiktokUsername = role === 'brand' ? document.getElementById('register-tiktok')?.value : '';

  try {
    const response = await axios.post(`${API_URL}/auth/register`, { name, email, password, role, tiktokUsername });
    localStorage.setItem('token', response.data.token);
    currentUser = response.data.user;
    updateUI();
    document.getElementById('registerModal').style.display = 'none';
  } catch (error) {
    alert(error.response?.data?.error || 'Registration failed');
  }
}

async function handleCreateCampaign(e) {
  e.preventDefault();
  if (!currentUser || currentUser.role !== 'brand') {
    alert('Only brands can create campaigns');
    return;
  }

  const campaign = {
    title: document.getElementById('campaign-title').value,
    description: document.getElementById('campaign-description').value,
    industry: document.getElementById('campaign-industry').value,
    budget: document.getElementById('campaign-budget').value,
    performanceModel: document.getElementById('campaign-performance').value,
    deadline: document.getElementById('campaign-deadline').value,
    niches: document.getElementById('campaign-niches').value.split(',').map(n => n.trim()),
  };

  try {
    await axios.post(`${API_URL}/campaigns/create`, campaign, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    document.getElementById('campaignModal').style.display = 'none';
    loadCampaigns();
  } catch (error) {
    alert(error.response?.data?.error || 'Failed to create campaign');
  }
}

async function loadCampaigns() {
  const industry = document.getElementById('industry').value;
  const budget = document.getElementById('budget').value;
  const performance = document.getElementById('performance').value;

  try {
    const response = await axios.get(`${API_URL}/campaigns`);
    const campaigns = response.data.filter(c => {
      return (
        (!industry || c.industry === industry) &&
        (!budget || c.budget === budget) &&
        (!performance || c.performanceModel === performance)
      );
    });

    const cardGrid = document.querySelector('#campaigns-tab .card-grid');
    cardGrid.innerHTML = campaigns.map(campaign => `
      <div class="card campaign-card" data-id="${campaign._id}">
        <div class="card-header">
          <h3><a href="campaign.html?id=${campaign._id}">${campaign.title}</a></h3>
          <span class="campaign-badge">${campaign.performanceModel}</span>
        </div>
        <div class="card-body">
          <p><strong>Advertiser TikTok:</strong> <a href="https://www.tiktok.com/@${campaign.tiktokUsername}" target="_blank">@${campaign.tiktokUsername}</a></p>
          <p>${campaign.description}</p>
          <div class="niche-tags">
            ${campaign.niches.map(tag => `<span class="niche-tag">${tag}</span>`).join('')}
          </div>
          <div class="stats">
            <div class="stat">
              <span class="stat-value">${campaign.budget}</span>
              <span class="stat-label">Budget</span>
            </div>
            <div class="stat">
              <span class="stat-value">${campaign.applications.length}</span>
              <span class="stat-label">Applications</span>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <span>Deadline: ${new Date(campaign.deadline).toLocaleDateString()}</span>
          <button class="btn btn-primary btn-sm apply-campaign">Apply Now</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.apply-campaign').forEach(button => {
      button.addEventListener('click', async () => {
        if (!currentUser || currentUser.role !== 'influencer') {
          alert('Only influencers can apply to campaigns');
          return;
        }
        const campaignId = button.closest('.campaign-card').dataset.id;
        try {
          await axios.post(`${API_URL}/campaigns/${campaignId}/apply`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          alert('Applied successfully');
          loadCampaigns();
        } catch (error) {
          alert(error.response?.data?.error || 'Failed to apply');
        }
      });
    });
  } catch (error) {
    console.error('Error loading campaigns:', error);
  }
}

async function loadInfluencers() {
  const niche = document.getElementById('influencer-niche').value;
  const followers = document.getElementById('followers').value;
  const rate = document.getElementById('rate').value;

  try {
    const response = await axios.get(`${API_URL}/campaigns/influencers`);
    const influencers = response.data.filter(i => {
      const followerRange = {
        nano: i.followers >= 1000 && i.followers < 10000,
        micro: i.followers >= 10000 && i.followers < 50000,
        mid: i.followers >= 50000 && i.followers < 500000,
        macro: i.followers >= 500000,
      };
      const rateRange = {
        low: i.ratePerPost >= 50 && i.ratePerPost < 200,
        medium: i.ratePerPost >= 200 && i.ratePerPost < 500,
        high: i.ratePerPost >= 500 && i.ratePerPost < 1000,
        premium: i.ratePerPost >= 1000,
      };
      return (
        (!niche || i.niche === niche) &&
        (!followers || followerRange[followers]) &&
        (!rate || rateRange[rate])
      );
    });

    const cardGrid = document.querySelector('#influencers-tab .card-grid');
    cardGrid.innerHTML = influencers.map(influencer => `
      <div class="card influencer-card">
        <div class="card-header">
          <div class="influencer-avatar">
            <img src="${influencer.avatar}" alt="${influencer.name}">
          </div>
          <div class="influencer-info">
            <h3><a href="profile.html?id=${influencer._id}">${influencer.name}</a></h3>
            <p>${influencer.niche}</p>
          </div>
        </div>
        <div class="card-body">
          <div class="stats">
            <div class="stat">
              <span class="stat-value">${influencer.followers}</span>
              <span class="stat-label">Followers</span>
            </div>
            <div class="stat">
              <span class="stat-value">${influencer.engagementRate}%</span>
              <span class="stat-label">Engagement</span>
            </div>
            <div class="stat">
              <span class="stat-value">$${influencer.ratePerPost}</span>
              <span class="stat-label">Rate/Post</span>
            </div>
          </div>
          <div class="niche-tags">
            ${influencer.niche.split(',').map(tag => `<span class="niche-tag">${tag.trim()}</span>`).join('')}
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-outline">View Profile</button>
          <button class="btn btn-primary">Contact</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading influencers:', error);
  }
}

function checkAuthStatus() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwt_decode(token);
      currentUser = decoded;
      updateUI();
    } catch (error) {
      localStorage.removeItem('token');
      currentUser = null;
      updateUI();
    }
  }
}

function updateUI() {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const createCampaignBtn = document.getElementById('createCampaignBtn');

  if (currentUser) {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    createCampaignBtn.style.display = currentUser.role === 'brand' ? 'inline-flex' : 'none';
    document.querySelector('.auth-buttons').insertAdjacentHTML(
      'beforeend',
      `<button class="btn btn-outline" id="logoutBtn">Logout</button>`
    );
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await axios.post(`${API_URL}/auth/logout`);
      localStorage.removeItem('token');
      currentUser = null;
      updateUI();
      window.location.reload();
    });
  } else {
    loginBtn.style.display = 'inline-flex';
    registerBtn.style.display = 'inline-flex';
    createCampaignBtn.style.display = 'none';
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.remove();
  }
}

// Add jwt-decode for client-side token decoding
const jwt_decode = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};