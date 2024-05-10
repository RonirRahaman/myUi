import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Main component', () => {
  render(<App />);
  const linkElement = screen.getByText('main-component');
  expect(linkElement).toBeInTheDocument();
});
