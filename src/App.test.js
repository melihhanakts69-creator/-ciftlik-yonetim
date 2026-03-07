import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('App', () => {
  test('renders landing page by default when not authenticated', () => {
    localStorage.clear();

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // LandingPage üzerindeki ana metinlerden birini kontrol edelim
    // (İleride metin değişirse bu assertion güncellenebilir)
    const landingText = screen.getByText(/Çiftlik yönetimini kolaylaştır/i);
    expect(landingText).toBeInTheDocument();
  });
});
