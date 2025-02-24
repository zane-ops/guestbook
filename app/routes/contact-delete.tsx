import React from "react";
import type { Route } from "./+types/contact";
import { deleteContact } from "../data";
import { redirect } from "react-router";

export async function action({ params }: Route.ActionArgs) {
	await deleteContact(params.contactId);
	return redirect("/");
}
