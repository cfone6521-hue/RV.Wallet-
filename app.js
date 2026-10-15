const elements = {
  connectButton: document.getElementById('connectButton'),
  refreshButton: document.getElementById('refreshButton'),
  transactionsButton: document.getElementById('transactionsButton'),
  copyAddressButton: document.getElementById('copyAddressButton'),
  chainSelect: document.getElementById('chainSelect'),
  connectionStatus: document.getElementById('connectionStatus'),
  walletTitle: document.getElementById('walletTitle'),
  walletAddress: document.getElementById('walletAddress'),
  walletState: document.getElementById('walletState'),
  tokenCount: document.getElementById('tokenCount'),
  lastUpdate: document.getElementById('lastUpdate'),
  balanceBadge: document.getElementById('balanceBadge'),
  balanceContainer: document.getElementById('balanceContainer'),
  transactionsContainer: document.getElementById('transactionsContainer')
};

let state = {
  walletConnected: false,
  walletAddress: null,
  selectedChain: '1',
  lastData: null
};

const chainNames = {
  '1': 'Ethereum Mainnet',
  '56': 'BNB Smart Chain',
  '137': 'Polygon',
  '8453': 'Base',
  '42161': 'Arbitrum One',
  '10': 'Optimism'
};

function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function updateWalletUI() {
  if (state.walletConnected) {
    elements.connectionStatus.textContent = 'Conectada';
    elements.connectionStatus.className = 'tag';
    elements.connectionStatus.style.background = 'rgba(0, 216, 143, 0.12)';
    elements.connectionStatus.style.color = '#00d88f';
    elements.walletTitle.textContent = 'Carteira conectada';
    elements.walletAddress.textContent = state.walletAddress;
    elements.walletState.textContent = 'Online';
    elements.walletState.style.color = '#00d88f';
    elements.copyAddressButton.disabled = false;
    elements.connectButton.textContent = 'Desconectar';
  } else {
    elements.connectionStatus.textContent = 'Desconectada';
    elements.connectionStatus.className = 'tag';
    elements.connectionStatus.style.background = 'rgba(255, 107, 107, 0.1)';
    elements.connectionStatus.style.color = '#ff6b6b';
    elements.walletTitle.textContent = 'Nenhuma carteira conectada';
    elements.walletAddress.textContent = 'Conecte uma carteira EVM compatível para começar.';
    elements.walletState.textContent = 'Offline';
    elements.walletState.style.color = '#ff6b6b';
    elements.copyAddressButton.disabled = true;
    elements.connectButton.textContent = 'Conectar carteira';
    elements.tokenCount.textContent = '—';
    elements.lastUpdate.textContent = '—';
    elements.balanceBadge.textContent = 'Aguardando consulta';
    showEmptyBalances();
    showEmptyTransactions();
  }
}

function showEmptyBalances() {
  elements.balanceContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">◇</div>
      <strong>Nenhum dado carregado</strong>
      <p>Conecte sua carteira e clique em "Atualizar painel".</p>
    </div>
  `;
}

function showEmptyTransactions() {
  elements.transactionsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⇄</div>
      <strong>Seu histórico aparecerá aqui</strong>
      <p>Conecte uma carteira e consulte as transações disponíveis.</p>
    </div>
  `;
}

function displayTokens(tokens) {
  if (!tokens || tokens.length === 0) {
    elements.balanceContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◇</div>
        <strong>Nenhum token encontrado</strong>
        <p>Nenhum ativo detectado na rede selecionada.</p>
      </div>
    `;
    elements.tokenCount.textContent = '0';
    return;
  }

  elements.tokenCount.textContent = tokens.length;
  elements.balanceContainer.innerHTML = `
    <div style="display: grid; gap: 0.75rem;">
      ${tokens.map(token => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: #0b1815; border-radius: 8px; border: 1px solid #142b25;">
          <div>
            <strong style="display: block;">${token.symbol || 'TOKEN'}</strong>
            <small style="color: #5a7a6f; font-size: 0.75rem;">${token.name || 'Token desconhecido'}</small>
          </div>
          <div style="text-align: right;">
            <strong style="display: block; color: #00d88f;">${token.balanceFormatted || '0.0000'}</strong>
            <small style="color: #5a7a6f; font-size: 0.7rem;">${token.decimals || 18} decimais</small>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function displayTransactions(transactions) {
  if (!transactions || transactions.length === 0) {
    elements.transactionsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⇄</div>
        <strong>Nenhuma transação encontrada</strong>
        <p>Nenhum registro de movimentação detectado.</p>
      </div>
    `;
    return;
  }

  elements.transactionsContainer.innerHTML = `
    <div style="display: grid; gap: 0.75rem;">
      ${transactions.map(tx => `
        <div style="padding: 0.85rem 1rem; background: #0b1815; border-radius: 8px; border: 1px solid #142b25;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span style="font-size: 0.8rem; padding: 0.15rem 0.5rem; background: ${tx.type === 'in' ? 'rgba(0, 216, 143, 0.12)' : 'rgba(255, 107, 107, 0.1)'}; color: ${tx.type === 'in' ? '#00d88f' : '#ff6b6b'}; border-radius: 4px;">
              ${tx.type === 'in' ? 'Entrada' : 'Saída'}
            </span>
            <small style="color: #5a7a6f; font-size: 0.7rem;">${tx.date || '—'}</small>
          </div>
          <strong style="font-size: 0.9rem;">${tx.hash || 'Sem hash'}</strong>
          <div style="margin-top: 0.25rem; font-size: 0.8rem; color: #9fc9ba;">
            Valor: <strong style="color: ${tx.type === 'in' ? '#00d88f' : '#ff6b6b'};">${tx.value || '0'}</strong>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function simulateWalletConnection() {
  const mockAddress = '0x' + Array(40).fill('0123456789abcdef'.split('')[Math.floor(Math.random() * 16)]).join('');
  state.walletConnected = true;
  state.walletAddress = mockAddress;
  updateWalletUI();
}

function disconnectWallet() {
  state.walletConnected = false;
  state.walletAddress = null;
  updateWalletUI();
}

async function fetchBalances() {
  if (!state.walletConnected) {
    showEmptyBalances();
    return;
  }

  elements.balanceBadge.textContent = 'Carregando...';
  elements.balanceBadge.style.background = 'rgba(255, 215, 0, 0.1)';
  elements.balanceBadge.style.color = '#ffd700';

  try {
    const response = await fetch(`/api/balances?address=${state.walletAddress}&chainId=${state.selectedChain}`);
    const result = await response.json();

    if (result.success && result.data?.data?.[0]?.tokenAssets) {
      const tokens = result.data.data[0].tokenAssets.map(asset => ({
        name: asset.name || 'Token',
        symbol: asset.symbol || '???',
        balance: asset.balance || '0',
        balanceFormatted: asset.balance 
          ? (Number(asset.balance) / Math.pow(10, asset.decimals || 18)).toFixed(4)
          : '0.0000',
        decimals: asset.decimals || 18
      }));
      
      displayTokens(tokens);
      elements.balanceBadge.textContent = `${tokens.length} ativos`;
      elements.balanceBadge.style.background = 'rgba(0, 216, 143, 0.12)';
      elements.balanceBadge.style.color = '#00d88f';
    } else {
      displayTokens([]);
      elements.balanceBadge.textContent = 'Sem dados';
      elements.balanceBadge.style.background = 'rgba(255, 107, 107, 0.1)';
      elements.balanceBadge.style.color = '#ff6b6b';
    }
  } catch (error) {
    console.error('Erro ao buscar saldos:', error);
    elements.balanceContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠</div>
        <strong>Erro na consulta</strong>
        <p>Não foi possível conectar à API. Verifique se o servidor está rodando.</p>
      </div>
    `;
    elements.balanceBadge.textContent = 'Erro';
    elements.balanceBadge.style.background = 'rgba(255, 107, 107, 0.1)';
    elements.balanceBadge.style.color = '#ff6b6b';
  }

  elements.lastUpdate.textContent = getCurrentTime();
}

async function fetchTransactions() {
  if (!state.walletConnected) {
    showEmptyTransactions();
    return;
  }

  elements.transactionsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⟳</div>
      <strong>Consultando transações...</strong>
      <p>Aguarde um momento.</p>
    </div>
  `;

  try {
    const response = await fetch(`/api/transactions?address=${state.walletAddress}&chainId=${state.selectedChain}`);
    const result = await response.json();

    if (result.success && result.data?.data?.[0]?.transactionList) {
      const transactions = result.data.data[0].transactionList.map(tx => ({
        hash: tx.hash || '—',
        value: tx.value || '0',
        type: tx.from && tx.from.toLowerCase() === state.walletAddress.toLowerCase() ? 'out' : 'in',
        date: tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleDateString('pt-BR') : '—'
      }));
      displayTransactions(transactions);
    } else {
      displayTransactions([]);
    }
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    elements.transactionsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠</div>
        <strong>Erro na consulta</strong>
        <p>Não foi possível buscar o histórico. Tente novamente mais tarde.</p>
      </div>
    `;
  }
}

function copyAddress() {
  if (state.walletAddress) {
    navigator.clipboard.writeText(state.walletAddress).then(() => {
      const originalText = elements.copyAddressButton.textContent;
      elements.copyAddressButton.textContent = 'Copiado!';
      setTimeout(() => {
        elements.copyAddressButton.textContent = originalText;
      }, 2000);
    });
  }
}

function initEvents() {
  elements.connectButton.addEventListener('click', () => {
    if (state.walletConnected) {
      disconnectWallet();
    } else {
      simulateWalletConnection();
    }
  });

  elements.refreshButton.addEventListener('click', fetchBalances);
  elements.transactionsButton.addEventListener('click', fetchTransactions);
  elements.copyAddressButton.addEventListener('click', copyAddress);

  elements.chainSelect.addEventListener('change', (e) => {
    state.selectedChain = e.target.value;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateWalletUI();
  initEvents();
});
