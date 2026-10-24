"use client";

import { useState } from "react";
import { Bot, CircleHelp, MessageCircle } from "lucide-react";
import { matchFaq } from "@/lib/faq-match";
import { useT } from "./i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface Entry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
}

/** Try a visitor question against the saved answers, exactly as the site's assistant matches it. */
export function FaqTester({ entries }: { entries: Entry[] }) {
  const t = useT();
  const [question, setQuestion] = useState("");
  const asked = question.trim();
  const match = asked ? matchFaq(question, entries) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageCircle className="size-[18px] text-primary" aria-hidden="true" /> {t("Test the chatbot")}
        </CardTitle>
        <CardDescription>{t("Type a question the way a visitor would, in English, Portuguese or French.")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t("e.g. Onde posso ver os resultados?")}
          aria-label={t("Visitor question")}
          enterKeyHint="search"
        />
        {asked && (
          <div className="flex flex-col gap-3 rounded-lg bg-muted p-4" aria-live="polite">
            <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">{asked}</p>
            <div className="flex max-w-[90%] gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sidebar text-highlight">
                <Bot className="size-4" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1.5 rounded-2xl rounded-tl-sm border bg-card px-3.5 py-2.5 text-sm">
                {match ? (
                  <>
                    <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <CircleHelp className="size-3.5" aria-hidden="true" /> {t("Matched: {question}", { question: match.question })}
                    </span>
                    <p>{match.answer}</p>
                  </>
                ) : (
                  <p>{t("No match. The assistant will suggest the Games guide. Add keywords to an answer to cover this question.")}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
