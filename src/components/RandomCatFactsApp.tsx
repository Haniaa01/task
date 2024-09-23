import React, { useState, useEffect } from 'react';
import { Observable } from 'rxjs';
import './RandomCatFactsApp.css';

interface CatFact {
    user: string;
    fact: string;
}

const createEventSourceObservable = (url: string): Observable<CatFact> => {
    return new Observable((observer) => {
        const eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
            const newFact: CatFact = JSON.parse(event.data);
            observer.next(newFact);
        };

        eventSource.onerror = (error) => {
            observer.error(error);
        };

        return () => {
            eventSource.close();
        };
    });
};

const RandomCatFactsApp: React.FC = () => {
    const [facts, setFacts] = useState<CatFact[]>(Array(6).fill({ user: 'Loading...', fact: 'Loading fact...' }));

    useEffect(() => {
        const catFacts$ = createEventSourceObservable('http://localhost:8080/cat-facts');

        const subscription = catFacts$.subscribe({
            next: (newFact) => {
                setFacts((prevFacts) => {
                    const newFacts = [...prevFacts];
                    const randomIndex = Math.floor(Math.random() * newFacts.length);
                    newFacts[randomIndex] = newFact;
                    return newFacts;
                });
            },
            error: (err) => console.error('Error: ', err),
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div>
            <h1 className="header-title">Cat Facts Application</h1>
            <div className="grid-container">
                {facts.map((fact, index) => (
                    <div key={index} className="card">
                        <p>by {fact.user}</p>
                        <p>{fact.fact}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RandomCatFactsApp;
