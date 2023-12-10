package kr.co.jsini.dental.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

@RestController
public class apiController {
	
    /*
	@RequestMapping("/api")
	public String mainPage(Model model, @RequestParam Map<String, String> params) {
        model.addAttribute("data", "jjjjjjjjjj");
		return "content/index";
	}
    */

	@RequestMapping("/api")
	public Object projectInfo(Model model, @RequestParam Map<String, String> params) {

		// HashMap hm = new HashMap<>();
		// hm.put("proc", "aaaaaaaaaaa");
		// hm.put("pi", "bbbbbbbbbb");		
		// hm.put("sc", "ccccccccccc");

		// return hm;



JsonObject jo = new JsonObject();

		jo.addProperty("projectName", "preword");
		jo.addProperty("author", "hello-bryan");
		jo.addProperty("createdDate", new Date().toString());

		JsonArray ja = new JsonArray();
		for (int i = 0; i < 5; i++) {
			JsonObject jObj = new JsonObject();
			jObj.addProperty("prop" + i, i);
			ja.add(jObj);
		}

		jo.add("follower", ja);

		return jo.toString();

	}
	

}