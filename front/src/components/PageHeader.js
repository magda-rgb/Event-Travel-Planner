import { useNavigate } from 'react-router-dom';
import useThemeToggle from '../hooks/useThemeToggle';


function PageHeader({ showBack = true, backLabel = 'Wróć' }) {
  const navigate = useNavigate();
  const { themeOn, toggleTheme } = useThemeToggle();

  return (
    <section className="heading">
      <div className="heading-text">
        {showBack ? (
          <button
            type="button"
            className="ghost-btn"
            onClick={() => navigate(-1)}
          >
            {backLabel}
          </button>
        ) : null}
      </div>
      <div className="heading-two">
        <section className="buttons-sth">
          <button
            type="button"
            className={`inline-flex h-[30px] w-14 items-center rounded-full p-[3px] transition-colors duration-200 ${
              themeOn ? 'bg-[#66d9e8]' : 'bg-[#7a91d6]'
            }`}
            onClick={toggleTheme}
            aria-label="Motyw"
          >
            <span
              className={`h-6 w-6 rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.2)] transition-transform duration-200 ${
                themeOn ? 'translate-x-[26px]' : 'translate-x-0'
              }`}
            />
          </button>
        </section>
      </div>
    </section>
  );
}

export default PageHeader;
