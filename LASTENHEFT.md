# Lastenheft — Holdfast ELO-System Web-App

**Projekt:** Holdfast: Nations at War — ELO-Ranglisten-App  
**Version:** 1.0  
**Datum:** 2026-06-04  
**Status:** Entwurf

---

## 1. Projektziel und Kontext

Es soll eine Web-App entwickelt werden, die eine ELO-basierte Rangliste für das Spiel *Holdfast: Nations at War* verwaltet. Die App richtet sich an einen festen Freundeskreis von 20–30 Spielern und ermöglicht das strukturierte Erfassen, Bestätigen und Auswerten von 1-vs-1-Spielergebnissen. Ein unabhängiger Admin (Schiedsrichter) fungiert als vertrauenswürdige Instanz für die Ergebnisbestätigung.

---

## 2. Zielgruppe

| Rolle | Beschreibung |
|---|---|
| **Spieler** | Registrierte Nutzer, die Matches eintragen und ihre Statistiken einsehen |
| **Admin / Schiedsrichter** | Vertrauensperson, die Ergebnisse bestätigt, Nutzer verwaltet und die Rangliste administriert |
| **Besucher** | Nicht eingeloggte Personen, die das öffentliche Leaderboard einsehen können |

---

## 3. Funktionale Anforderungen

### 3.1 Authentifizierung & Benutzerverwaltung

- **LF-01** Spieler können sich per Google SSO registrieren und anmelden.
- **LF-02** Alternativ ist eine Registrierung mit Benutzername, Passwort und TOTP (Zwei-Faktor-Authentifizierung) möglich.
- **LF-03** Jede Registrierung — ob selbst initiiert oder durch den Admin angelegt — erfordert eine explizite Freigabe durch einen Admin, bevor der Account aktiv wird.
- **LF-04** Admins können neue Benutzeraccounts direkt anlegen.
- **LF-05** Admins können Benutzeraccounts löschen.
- **LF-06** Jedes Benutzerprofil enthält einen **Anzeigenamen** und eine eindeutige **Spieler-ID**. Kein Avatar.

### 3.2 Match-Erfassung

- **LF-07** Eingeloggte Spieler können ein abgeschlossenes 1-vs-1-Match über ein Formular eintragen. Pflichtfelder: Gegner (aus Liste), Ergebnis (Gewinner).
- **LF-08** Ein eingetragenes Match hat den Status **„Ausstehend"**, bis ein Admin es bestätigt.
- **LF-09** Erst nach Admin-Bestätigung wird das Match in die ELO-Berechnung einbezogen.
- **LF-10** Nach der Bestätigung durch den Admin ist das Match **unveränderlich festgeschrieben**.

### 3.3 Admin-Bereich (Schiedsrichter)

- **LF-11** Admins sehen eine Übersicht aller ausstehenden Matches und können diese bestätigen oder korrigieren (Ergebnis ändern).
- **LF-12** Admins können Benutzer anlegen und löschen.
- **LF-13** Admins können die **gesamte ELO-Rangliste zurücksetzen** (alle ELO-Werte auf Startwert, Match-Historie bleibt optional erhalten).
- **LF-14** Es gibt nur eine Admin-Rolle ohne weitere Abstufungen.

### 3.4 Spieler-Dashboard (eingeloggt)

- **LF-15** Das Dashboard zeigt den **ELO-Verlauf** des eingeloggten Spielers als Liniendiagramm.
- **LF-16** Das Dashboard zeigt die **Win/Loss-Statistik** (Anzahl Siege, Niederlagen, Quote).
- **LF-17** Das Dashboard zeigt den **aktuellen Rang** in der Gesamtrangliste.

### 3.5 Spielerprofil (öffentlich einsehbar)

- **LF-18** Eingeloggte Spieler können die Profilseiten anderer Spieler aufrufen und deren ELO-Verlauf sowie Win/Loss-Statistik einsehen.

### 3.6 Öffentliches Leaderboard

- **LF-19** Die globale Rangliste ist **ohne Login** öffentlich einsehbar. Sie zeigt alle Spieler sortiert nach aktuellem ELO-Wert (Rang, Anzeigename, ELO, W/L).

---

## 4. Nicht-funktionale Anforderungen

- **LNF-01** Die App ist vollständig auf **Deutsch** gehalten.
- **LNF-02** Die Benutzeroberfläche folgt der Ästhetik von *Holdfast: Nations at War*: Preußisches Blau als Primärfarbe, Typografie im Stil militärischer Dokumente des 19. Jahrhunderts (kondensierte Bold-Serifen für Überschriften, Monospace für Textkörper, ggf. Fraktur-Akzente als UI-Dekoration).
- **LNF-03** Das Logo besteht ausschließlich aus Text (kein Bildzeichen).
- **LNF-04** Die App ist für Desktop-Browser optimiert (primäre Nutzung). Mobile-Responsiveness ist wünschenswert, aber nicht Priorität.
- **LNF-05** Die App muss für 20–30 gleichzeitige Nutzer performant sein.
- **LNF-06** Die gesamte Authentifizierung und Benutzerdatenverwaltung erfolgt über Supabase (kein eigenes Auth-System).

---

## 5. Systemgrenzen und externe Schnittstellen

| System | Rolle |
|---|---|
| **Supabase** | Datenbank (PostgreSQL), Authentifizierung (Google SSO, E-Mail/PW + TOTP), Row-Level-Security |
| **Vercel** | Hosting und Deployment der Web-App |
| **Google OAuth** | SSO-Anmeldung via Supabase Auth Provider |

---

## 6. Abgrenzung (nicht im Scope)

- Keine Mehrspielermodi (z.B. Teams, Turniere, Brackets) in Version 1.0
- Kein Avatar-Upload
- Keine In-App-Benachrichtigungen oder E-Mail-Notifications
- Keine API für externe Systeme
- Keine Mobile App

---

## 7. Abnahmekriterien

- [ ] Spieler kann sich per Google SSO registrieren; Account ist erst nach Admin-Freigabe aktiv
- [ ] Spieler kann ein Match eintragen; ELO ändert sich erst nach Admin-Bestätigung
- [ ] Bestätigte Matches sind nicht mehr editierbar
- [ ] Admin kann ausstehende Matches korrigieren und bestätigen
- [ ] Admin kann Benutzer anlegen und löschen
- [ ] Admin kann die gesamte Rangliste zurücksetzen
- [ ] Öffentliches Leaderboard ist ohne Login aufrufbar
- [ ] Spieler-Dashboard zeigt ELO-Verlauf, W/L-Statistik und aktuellen Rang
- [ ] TOTP-Anmeldung funktioniert für Passwort-Nutzer
- [ ] Design entspricht dem definierten Stil (Preußisches Blau, militärische Typografie)
