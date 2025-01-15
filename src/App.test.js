import { render, screen } from '@testing-library/react';
import App from './App';

test('renders study at rsschool link', () => {
  render(<App />);
  const linkElement = screen.getByText(/study at rsschool/i);
  expect(linkElement).toBeInTheDocument();
});
