"use client";

import AddOperation from "@/components/AddOperation";
import FondDeCaisse from "@/components/CashRegister";
import CashRegisterChoice from "@/components/CashRegisterChoice";
import ControlCashRegister from "@/components/ControlCashRegister";
import OperationsList from "@/components/OperationsList";
import TodayOperationsSummary from "@/components/TodayOperationsSummary";
import TransferCashRegister from "@/components/TransferCashRegister";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCaisseStore } from "@/hooks/store";
import { useSyncCaisse, useSyncControlCaisse, useSyncFondDeCaisse, useSyncOperations, useSyncOperationSum } from "@/hooks/sync";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Fragment, MouseEvent, useState } from "react";

export default function Page() {
  const [sideBarVisible, setSideBarVisible] = useState(true);
  const toggleVisibility = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSideBarVisible((prev) => !prev);
  };
  useSyncCaisse();
  useSyncFondDeCaisse();
  useSyncOperationSum();
  useSyncOperations();
  useSyncControlCaisse();

  return (
    <Fragment>
      <div>
        <Button className={"mb-4 ml-auto max-lg:hidden"} variant={"outline"} onClick={toggleVisibility}>
          {sideBarVisible ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </Button>
        <div
          className={cn("flex shrink-0 flex-col gap-y-2 overflow-hidden transition-all duration-500 ease-in-out", {
            "lg:w-0": !sideBarVisible,
            "px-1 lg:w-72": sideBarVisible,
          })}
        >
          <CashRegisterChoice />

          <div className={"relative flex shrink-0 flex-col gap-y-2 p-2 lg:w-fit"}>
            <DisabledCashRegisterBadge />
            <FondDeCaisse />
            <TodayOperationsSummary />
            <AddOperation />
            <ControlCashRegister />
            <TransferCashRegister />
          </div>
        </div>
      </div>

      <div className={"w-full"}>
        <OperationsList />
      </div>
    </Fragment>
  );
}

function DisabledCashRegisterBadge() {
  const { caisse } = useCaisseStore();
  if (!caisse?.cai_desactive) return null;
  return (
    <div className={"absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-white/30 backdrop-blur-sm backdrop-grayscale hover:cursor-not-allowed"}>
      <Badge variant={"destructive"}>Caisse désactivée</Badge>
    </div>
  );
}
