-- NETA Prep: Fix domain structure to match official NETA Level 3 blueprint
-- Source: 2022_DCO_2_24_23.pdf — official 4-domain structure
--
-- The old 5-domain schema had a standalone 'power-systems-calc' domain.
-- The official blueprint absorbs those topics into 'fundamentals-theory'.
-- This migration updates the domain field on all affected questions.

UPDATE public.questions
SET domain = 'fundamentals-theory'
WHERE domain = 'power-systems-calc';
