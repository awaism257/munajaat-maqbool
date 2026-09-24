# Translation Notes

## Source and method

The English text shipped in this edition is a **fresh, independent translation
made from the Arabic source only**. It was not derived from, and does not
reproduce, the English translation or footnotes bundled with the discontinued
reference app or the printed book.

- The Arabic source is the audited Arabic text already present in this
  repository (`tools/arabic_content.json`).
- The English translation covers all **195 items** across the seven daily
  sections (46/35/31/33/22/15/13 for Saturday through Friday).
- The translation is stored separately in `tools/english_translation.json` and
  merged with the Arabic by `tools/build_content.py`.

## Independent review

The translation underwent an independent review pass covering all seven days.
The review produced nine suggestions in total:

- **7 corrections were accepted and applied** before integration:
  1. Sunday 7 — "heirs from us" reworded to "the last thing to leave us until death".
  2. Monday 28 — "wretched by Your supplication" corrected to "wretched through my supplication to You".
  3. Tuesday 19 — "poor in spirit" corrected to "one who is poor" (three clauses).
  4. Tuesday 23 — "the Decree" corrected to "the Judgment".
  5. Wednesday 11 — "reconcile their hearts" corrected to "set right the relations between them".
  6. Wednesday 22 — "the two floods: the torrent and the destructive surging one" corrected to "the two blindly destructive ones: the flood and the fierce camel".
  7. Thursday 14 — "O Lord of God-consciousness and Lord of forgiveness" corrected to "O Possessor of God-consciousness and forgiveness".
- **2 low-confidence suggestions were reviewed and deliberately not applied**
  (Saturday 36 and Wednesday 10), because the evidence for changing the
  existing wording was insufficient.

## Urdu review pass

The fresh translation was additionally reviewed item-by-item against the
public-domain Urdu edition of the booklet (the source PDF from which the
Arabic was typeset). All 195 items were cross-checked; 191 were confirmed
unchanged and **4 review-accepted corrections were applied**:

1. Saturday 29 — "so grant me victory" corrected to "so take retribution on
   my behalf" (Arabic *fa-intasir*, Q 54:10).
2. Sunday 35 — "the sufficiency of my master" corrected to "the sufficiency
   of my dependents" (Arabic *wa-ghinā mawlāya*, read per the Urdu).
3. Monday 29 — "ever-turning in sighing" reworded to "oft-sighing"
   (Arabic *awwāhah*).
4. Thursday 14 — closing invocation reworded to "O You who alone are worthy
   of reverent fear, and who alone are able to forgive".

## Footnotes

This edition ships **91 footnotes** (Saturday 37, Sunday 10, Monday 8,
Tuesday 25, Wednesday 2, Thursday 4, Friday 5). They are concise source
citations (Quranic references and hadith-collection attributions) and short
reading instructions taken from the booklet's printed Urdu notes, translated
into English. Where the booklet uses publisher-specific Quranic verse
numbering, the note gives the standard mus'haf reference with the discrepancy
recorded. Illegible or low-confidence printed notes were excluded rather than
published as uncertain attributions. One Sunday range note is attached once
to item 1 and records that it covers items 1–2.

## Remaining caveat

This translation has not yet been reviewed by a qualified human scholar of
Islamic texts. **A review by a qualified human scholar is strongly recommended
before publication or wide distribution.** Distributors should also confirm
they hold the necessary rights for all other bundled content (fonts, imagery,
and any third-party material) before release; see `PUBLISHING.md`.
