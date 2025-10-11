// src/pages/NotFoundPage/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';
import Button from '../../components/Button.jsx';

function NotFoundPage() {
    return (
        <div className={`${styles.notFoundContainer} page-enter`}>
            <h1 className={styles.errorCode}>404</h1>
            <h2 className={styles.errorTitle}>Strona Nie Znaleziona</h2>
            <p className={styles.errorMessage}>
                Przepraszamy, strona, której szukasz, mogła zostać usunięta, zmieniona jej nazwa lub jest tymczasowo niedostępna.
            </p>
            <Link to="/">
                <Button variant="primary">Wróć na Stronę Główną</Button>
            </Link>
        </div>
    );
}

export default NotFoundPage;