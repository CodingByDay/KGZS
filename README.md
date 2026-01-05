
# Portal za ocenjevanje živil – Digitalni ocenjevalni sistem

## ⚠️ Authoritative tech stack (non-negotiable)

This project MUST be implemented with:
- Backend: ASP.NET Core Web API (.NET)
- Frontend: React + TypeScript

Do not propose alternative frameworks (Vue/Angular/etc.).


Non-goals
- Do NOT propose alternative backend frameworks (Node, Java, etc.)
- Do NOT propose alternative frontend frameworks (Vue, Angular, etc.)
- Do NOT embed business logic in controllers or UI components

## Namen sistema
Ta projekt je spletna aplikacija za **digitalno ocenjevanje živil in prehranskih proizvodov**, ki nadomešča papirne in ročne postopke.

Sistem podpira celoten proces:
- prijave udeležencev,
- vnos živilskih vzorcev,
- digitalno ocenjevanje na tablicah,
- avtomatski izračun ocen,
- generiranje zapisnikov in analitičnih poročil.

Aplikacija je namenjena delu **na terenu**, tudi ob **nestabilni ali omejeni internetni povezavi**.

---

## Ključni koncepti sistema

### Dogodek ocenjevanja
Dogodek predstavlja posamezno ali periodično ocenjevanje živil.

Dogodek vsebuje:
- prijavitelje,
- vzorce živil,
- komisije,
- kriterije ocenjevanja,
- zapisnike in analitiko.

Dogodek se lahko ustvari:
- na novo ali
- s kopiranjem podatkov iz preteklih dogodkov (izborno).

---

## Uporabniške vloge

Sistem ima strogo definirane vloge in pravice:

- **Administrator**
  - sistemske nastavitve, šifranti, uporabniki
- **Organizator**
  - upravlja dogodke, prijave, vzorce, komisije
- **Predsednik komisije**
  - vodi ocenjevanje, aktivira vzorce, potrjuje zapisnike
- **Član komisije**
  - vnaša ocene in opombe
- **Vajenec komisije**
  - vnaša ocene (lahko izločene iz končnega izračuna)
- **Prijavitelj**
  - prijavi vzorce in prejme zapisnike
- **Potrošnik**
  - sodeluje v potrošniškem ocenjevanju

---

## Prijave in plačila

- javni prijavni obrazec
- potrditev e-pošte
- SMS validacija telefonske številke
- obvezno plačilo (če je zahtevano):
  - spletno
  - po predračunu
- dokler plačilo ni potrjeno:
  - prijava in vzorci so v stanju *osnutek*

---

## Vzorci živil

Vsak vzorec ima:
- zaporedno številko (letno ponastavljanje),
- pripadajočo kategorijo ali skupino,
- način ocenjevanja:
  - končna ocena ali
  - ocenjevanje po kriterijih,
- QR kodo in nalepko.

---

## Komisije in ocenjevanje

### Komisije
- vezane na kategorije živil
- imajo člane in vajence
- določene kriterije ocenjevanja
- možnost izključitve člana med ocenjevanjem

### Proces ocenjevanja
1. Predsednik komisije aktivira vzorec (QR koda ali izbor)
2. Ocenjevalni zaslon se odpre članom komisije
3. Člani vnesejo ocene in opombe
4. Vzorec se lahko izloči (obvezna utemeljitev)
5. Če več kot polovica komisije izloči vzorec → avtomatska izločitev
6. Opombe se zbirajo v skupni zapisnik

---

## Opombe in komentarji

- strukturiran izbor tipičnih napak ali lastnosti
- prosto besedilno polje
- možnost izbire načina vnosa pred začetkom ocenjevanja
- predsednik komisije pregleda in potrdi opombe za zapisnik

---

## Izračun ocen

- do 4 ocen → povprečje vseh
- 5 ali več ocen:
  - izloči se najvišja in najnižja ocena
  - izločijo se pripadajoče opombe

---

## Zapisniki

- avtomatsko generirani zapisniki
- pregled po statusih
- izvoz v PDF in Excel
- samodejno obveščanje prijaviteljev

---

## Analitika

- število podeljenih priznanj
- analiza po kategorijah in regijah
- izločeni vzorci
- napredno filtriranje
- Excel izvoz

---

## Potrošniško ocenjevanje

- ločeno od strokovnih komisij
- več stojnic ali točk hkrati
- vsak potrošnik odda oceno
- brez generiranja zapisnikov

---

## Tehnične zahteve

- večjezična podpora
- delovanje na tablicah in mobilnih napravah
- offline-first delovanje s kasnejšo sinhronizacijo
- avtomatizirana obvestila
- revizijska sled sprememb


## Domain abstraction rules

- The system must never assume a specific food type
- Categories, criteria, and evaluation logic are event-defined
- Domain-specific behavior must be configurable, not hardcoded
- Future domains may include:
  - meat
  - dairy
  - wine
  - honey
  - bakery
  - processed foods
